pub mod client;
pub mod game;
pub mod matcher;
pub mod proto;

use log::{error, info};
use rand::Rng;
use tokio::net::TcpListener;
use tokio::sync::mpsc::unbounded_channel;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    pretty_env_logger::init();

    let bind_addr = std::env::var("BIND_ADDR").unwrap();

    let (matcher_tx, matcher_rx) = unbounded_channel();
    tokio::spawn(matcher::listen(matcher_rx));

    let listener = TcpListener::bind(&bind_addr).await.unwrap();
    info!("server listening on {}", listener.local_addr().unwrap());

    let mut rng = rand::thread_rng();
    while let Ok((stream, peer)) = listener.accept().await {
        match tokio_tungstenite::accept_async(stream).await {
            Ok(stream) => {
                let id = rng.gen();
                info!("[{}] connected -> #{}", peer, id);
                tokio::spawn(client::handshake(id, matcher_tx.clone(), stream));
            }
            Err(e) => error!("[{}] failed to accept client: {}", peer, e),
        }
    }
}
