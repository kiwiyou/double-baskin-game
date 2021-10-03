use serde::{Deserialize, Serialize};
use tokio_tungstenite::tungstenite::Message;

#[derive(Deserialize)]
pub struct Hello<'a> {
    pub name: &'a str,
}

#[derive(Deserialize)]
pub struct Increase {
    pub index: u8,
    pub delta: u8,
}

#[derive(Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ClientBound<'a> {
    NewMatch { opponent: &'a str, is_turn: bool },
    UpdateCounter { counter: [u8; 2] },
    Win { quit: bool },
    Lose,
}

impl ClientBound<'_> {
    pub fn to_message(&self) -> Message {
        Message::Text(serde_json::to_string(self).unwrap())
    }
}
