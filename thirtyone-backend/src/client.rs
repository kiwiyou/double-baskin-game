use futures_util::stream::SplitStream;
use futures_util::StreamExt;
use log::{error, info};
use tokio::net::TcpStream;
use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::oneshot;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::WebSocketStream;

use crate::game::GameRequest;
use crate::matcher::{MatcherRequest, MatchingSession};
use crate::proto::{Hello, InGame};

pub async fn handshake(
    id: u32,
    matcher_tx: UnboundedSender<MatcherRequest>,
    stream: WebSocketStream<TcpStream>,
) {
    let (ws_tx, mut ws_rx) = stream.split();
    if let Some(Ok(message)) = ws_rx.next().await {
        if let Some(message) = message
            .to_text()
            .ok()
            .and_then(|text| serde_json::from_str::<'_, Hello>(text).ok())
        {
            let (match_tx, match_rx) = oneshot::channel();
            let enqueue = MatcherRequest::Enqueue(MatchingSession {
                id,
                name: message.name.to_string(),
                sender: ws_tx,
                notifier: match_tx,
            });
            if let Err(e) = matcher_tx.send(enqueue) {
                error!("[#{}] failed to queue client: {}", id, e);
            } else {
                tokio::spawn(wait_match(id, match_rx, matcher_tx, ws_rx));
                return;
            }
        }
    }
    info!("[#{}] handshake failed, dropping", id);
}

pub async fn wait_match(
    id: u32,
    notifier: oneshot::Receiver<UnboundedSender<GameRequest>>,
    matcher_tx: UnboundedSender<MatcherRequest>,
    mut stream: SplitStream<WebSocketStream<TcpStream>>,
) {
    let recv_message = async {
        while let Some(recv) = stream.next().await {
            match recv {
                Ok(Message::Close(_)) => {
                    info!("[#{}] closed, dropping", id);
                    break;
                }
                Err(e) => {
                    error!("[#{}] network error, dropping: {}", id, e);
                    break;
                }
                _ => {}
            }
        }
        // No more error handling required
        matcher_tx.send(MatcherRequest::Dequeue(id)).ok();
    };
    tokio::select! {
        game_tx = notifier => {
            match game_tx {
                Ok(game_tx) => {
                    tokio::spawn(run_game(id, game_tx, stream));
                }
                Err(e) => {
                    error!("[#{}] failed to get match notification: {}", id, e);
                }
            }
        }
        _ = recv_message => {}
    }
}

pub async fn run_game(
    id: u32,
    game_tx: UnboundedSender<GameRequest>,
    mut stream: SplitStream<WebSocketStream<TcpStream>>,
) {
    while let Some(message) = stream.next().await {
        match message {
            Ok(Message::Text(text)) => {
                if let Ok(increase) = serde_json::from_str::<'_, InGame>(&text) {
                    let request = match increase {
                        InGame::Delta { index, delta } => GameRequest::Delta {
                            from: id,
                            index: index as usize,
                            delta,
                        },
                        InGame::Pass { index, delta } => GameRequest::Pass {
                            from: id,
                            index: index as usize,
                            delta,
                        },
                    };
                    if let Err(e) = game_tx.send(request) {
                        error!("[#{}] failed to relay game packet: {}", id, e);
                        break;
                    }
                }
            }
            Ok(Message::Close(_)) => {
                game_tx.send(GameRequest::Quit(id)).ok();
                info!("[#{}] closed, dropping", id);
            }
            Err(e) => {
                error!("[#{}] network error, dropping: {}", id, e);
                break;
            }
            _ => {}
        }
    }
    // No error handling needed
    game_tx.send(GameRequest::Quit(id)).ok();
}
