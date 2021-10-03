use std::collections::{HashSet, VecDeque};

use futures_util::stream::SplitSink;
use futures_util::SinkExt;
use log::{debug, info};
use tokio::net::TcpStream;
use tokio::sync::mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender};
use tokio::sync::oneshot;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::WebSocketStream;

use crate::game::{self, GameRequest, GameSession};
use crate::proto::ClientBound;

pub enum MatcherRequest {
    Enqueue(MatchingSession),
    Dequeue(u32),
}

pub struct MatchingSession {
    pub id: u32,
    pub name: String,
    pub sender: SplitSink<WebSocketStream<TcpStream>, Message>,
    pub notifier: oneshot::Sender<UnboundedSender<GameRequest>>,
}

pub async fn listen(mut rx: UnboundedReceiver<MatcherRequest>) {
    let mut lobby = VecDeque::new();
    let mut open = HashSet::new();
    let mut closed = HashSet::new();
    while let Some(request) = rx.recv().await {
        match request {
            MatcherRequest::Enqueue(session) => {
                debug!("[#{}] queued match", session.id);
                open.insert(session.id);
                lobby.push_back(session);
                let mut players = vec![];
                while let Some(mut front) = lobby.pop_front() {
                    let id = front.id;
                    if closed.contains(&id) {
                        front.sender.send(Message::Close(None)).await.ok();
                    } else if !front.notifier.is_closed() {
                        players.push(front);
                    }
                    open.remove(&id);
                    closed.remove(&id);
                    if players.len() >= 2 {
                        break;
                    }
                }
                if players.len() < 2 {
                    players
                        .drain(..)
                        .rev()
                        .for_each(|player| lobby.push_front(player));
                } else {
                    let mut a = players.pop().unwrap();
                    let mut b = players.pop().unwrap();
                    let new_match_a = ClientBound::NewMatch {
                        opponent: &b.name,
                        is_turn: true,
                    }
                    .to_message();
                    let new_match_b = ClientBound::NewMatch {
                        opponent: &a.name,
                        is_turn: false,
                    }
                    .to_message();
                    a.sender.send(new_match_a).await.ok();
                    b.sender.send(new_match_b).await.ok();
                    let (game_tx, game_rx) = unbounded_channel();
                    a.notifier.send(game_tx.clone()).ok();
                    b.notifier.send(game_tx).ok();
                    debug!("new match [#{}, #{}]", a.id, b.id);
                    tokio::spawn(game::listen(
                        [
                            GameSession {
                                id: a.id,
                                sender: a.sender,
                            },
                            GameSession {
                                id: b.id,
                                sender: b.sender,
                            },
                        ],
                        game_rx,
                    ));
                }
            }
            MatcherRequest::Dequeue(id) => {
                debug!("[#{}] dequeued match", id);
                if open.contains(&id) {
                    open.remove(&id);
                    closed.insert(id);
                }
            }
        }
    }
    info!("matcher channel closed.");
}
