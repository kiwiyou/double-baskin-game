use serde::{Deserialize, Serialize};
use tokio_tungstenite::tungstenite::Message;

#[derive(Deserialize)]
pub struct Hello<'a> {
    pub name: &'a str,
}

#[derive(Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum InGame {
    Delta { index: u8, delta: u8 },
    Pass { index: u8, delta: u8 },
}

#[derive(Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ClientBound<'a> {
    Match { opponent: &'a str, is_turn: bool },
    Delta { index: u8, delta: u8 },
    Pass { counter: [u8; 2] },
    Win { quit: bool },
    Lose,
}

impl ClientBound<'_> {
    pub fn to_message(&self) -> Message {
        Message::Text(serde_json::to_string(self).unwrap())
    }
}
