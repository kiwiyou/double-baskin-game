use futures_util::stream::SplitSink;
use futures_util::SinkExt;
use log::{debug, trace};
use tokio::net::TcpStream;
use tokio::sync::mpsc::UnboundedReceiver;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::WebSocketStream;

pub enum GameRequest {
    Quit(u32),
    Delta { from: u32, index: usize, delta: u8 },
    Pass { from: u32, index: usize, delta: u8 },
}

pub struct GameSession {
    pub id: u32,
    pub sender: SplitSink<WebSocketStream<TcpStream>, Message>,
}

pub async fn listen(mut players: [GameSession; 2], mut game_rx: UnboundedReceiver<GameRequest>) {
    let mut turn = 0;
    let mut counter = [0u8, 0u8];
    let game_id = GameId(players[0].id, players[1].id);
    debug!("[{}] new game", game_id);
    while let Some(request) = game_rx.recv().await {
        match request {
            // Responsible for dropping IO-errored clients
            GameRequest::Quit(id) => {
                if id == players[0].id {
                    debug!("[{}] player {} quit", game_id, players[0].id);
                    // No error handling needed
                    players[1]
                        .sender
                        .send(ClientBound::Win { quit: true }.to_message())
                        .await
                        .ok();
                    break;
                } else if id == players[1].id {
                    debug!("[{}] player #{} quit", game_id, players[1].id);
                    // No error handling needed
                    players[0]
                        .sender
                        .send(ClientBound::Win { quit: true }.to_message())
                        .await
                        .ok();
                    break;
                }
            }
            GameRequest::Delta { from, index, delta } => {
                if from != players[turn].id {
                    debug!("[{}] delta from not-current player #{}", game_id, from);
                    continue;
                }
                match is_delta_valid(index, delta, &counter, false) {
                    DeltaValidity::Valid(_) => {
                        let delta_message = ClientBound::Delta {
                            index: index as u8,
                            delta,
                        };
                        for player in &mut players {
                            player.sender.send(delta_message.to_message()).await.ok();
                        }
                    }
                    DeltaValidity::IndexOutOfRange => {
                        debug!(
                            "[{}] invalid increase index {} from #{}",
                            game_id, index, from
                        );
                    }
                    DeltaValidity::DeltaOutOfRange => {
                        debug!(
                            "[{}] delta not in [0, 3]: {} from #{}",
                            game_id, delta, from
                        );
                    }
                    DeltaValidity::CounterOutOfRange(new_counter) => {
                        debug!(
                            "[{}] new counter value not in [0, 31]: {} from #{}",
                            game_id, new_counter, from
                        );
                    }
                }
            }
            GameRequest::Pass { from, index, delta } => {
                if from != players[turn].id {
                    debug!("[{}] pass from not-current player #{}", game_id, from);
                    continue;
                }
                match is_delta_valid(index, delta, &counter, true) {
                    DeltaValidity::Valid(new_counter) => {
                        counter[index] = new_counter;
                        trace!(
                            "[{}] new counter: [{}, {}]",
                            game_id,
                            counter[0],
                            counter[1]
                        );
                        let next_turn = (turn + 1) % 2;
                        if counter[0] >= 31 && counter[1] >= 31 {
                            players[turn]
                                .sender
                                .send(ClientBound::Lose.to_message())
                                .await
                                .ok();
                            players[next_turn]
                                .sender
                                .send(ClientBound::Win { quit: false }.to_message())
                                .await
                                .ok();
                        } else {
                            let pass = ClientBound::Pass { counter };
                            for player in &mut players {
                                player.sender.send(pass.to_message()).await.ok();
                            }
                            turn = next_turn;
                        }
                    }
                    DeltaValidity::IndexOutOfRange => {
                        debug!(
                            "[{}] invalid increase index {} from #{}",
                            game_id, index, from
                        );
                    }
                    DeltaValidity::DeltaOutOfRange => {
                        debug!(
                            "[{}] delta not in [1, 3]: {} from #{}",
                            game_id, delta, from
                        );
                    }
                    DeltaValidity::CounterOutOfRange(new_counter) => {
                        debug!(
                            "[{}] new counter value not in [0, 31]: {} from #{}",
                            game_id, new_counter, from
                        );
                    }
                }
            }
        }
    }
}

enum DeltaValidity {
    Valid(u8),
    IndexOutOfRange,
    DeltaOutOfRange,
    CounterOutOfRange(u8),
}
fn is_delta_valid(index: usize, delta: u8, counter: &[u8; 2], is_commit: bool) -> DeltaValidity {
    if !(0..2).contains(&index) {
        DeltaValidity::IndexOutOfRange
    } else if (is_commit && delta == 0) || !(0..=3).contains(&delta) {
        DeltaValidity::DeltaOutOfRange
    } else {
        let new_counter = counter[index] + delta;
        if !(0..=31).contains(&new_counter) {
            DeltaValidity::CounterOutOfRange(new_counter)
        } else {
            DeltaValidity::Valid(new_counter)
        }
    }
}

#[derive(Clone, Copy)]
pub struct GameId(u32, u32);

use std::fmt::{Display, Formatter};

use crate::proto::ClientBound;
impl Display for GameId {
    fn fmt(&self, f: &mut Formatter) -> std::fmt::Result {
        f.write_fmt(format_args!("#{}, #{}", self.0, self.1))
    }
}
