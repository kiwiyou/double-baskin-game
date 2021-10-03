use futures_util::stream::SplitSink;
use futures_util::SinkExt;
use log::{debug, error, trace};
use tokio::net::TcpStream;
use tokio::sync::mpsc::UnboundedReceiver;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::WebSocketStream;

pub enum GameRequest {
    Quit(u32),
    Increase { id: u32, index: u8, delta: u8 },
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
            // Assume no remote io error, wait for process on Quit event
            GameRequest::Increase { id, index, delta } => {
                if id != players[turn].id {
                    debug!("[{}] increase from not-current player #{}", game_id, id);
                    continue;
                }
                if !(0..2).contains(&index) {
                    debug!(
                        "[{}] invalid increase index {} from #{}",
                        game_id, index, id
                    );
                }
                if !(1..=3).contains(&delta) {
                    debug!("[{}] delta not in [1, 3]: {} from #{}", game_id, delta, id);
                    continue;
                }
                // counter in [0, 31] and delta in [1, 3], so never overflows
                let new_value = counter[index as usize] + delta;
                if !(1..=31).contains(&new_value) {
                    debug!(
                        "[{}] new counter value not in [1, 31]: {} from #{}",
                        game_id, new_value, id
                    );
                    continue;
                }
                trace!(
                    "[{}] new counter: [{}, {}]",
                    game_id,
                    counter[0],
                    counter[1]
                );
                counter[index as usize] = new_value;
                let update_counter = ClientBound::UpdateCounter {
                    counter: counter.clone(),
                };
                players[0]
                    .sender
                    .send(update_counter.to_message())
                    .await
                    .ok();
                players[1]
                    .sender
                    .send(update_counter.to_message())
                    .await
                    .ok();

                if counter[0] >= 31 && counter[1] >= 31 {
                    players[turn]
                        .sender
                        .send(ClientBound::Lose.to_message())
                        .await
                        .ok();
                    players[1 - turn]
                        .sender
                        .send(ClientBound::Win { quit: false }.to_message())
                        .await
                        .ok();
                    break;
                }

                turn = (turn + 1) % players.len();
            }
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
