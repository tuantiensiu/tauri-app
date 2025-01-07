// Prevents additional console window on Windows in release, DO NOT REMOVE!!
use actix_files::Files;
use actix_web::{App, HttpServer};
use std::thread;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Start Actix web server in a separate thread
    thread::spawn(|| {
        let sys = actix_web::rt::System::new();
        sys.block_on(async {
            HttpServer::new(|| {
                App::new().service(
                    Files::new(
                        "/",
                        "/storage/emulated/0/Android/data/com.tauri_app.app/files/Documents",
                    )
                    .show_files_listing()
                    .use_last_modified(true),
                )
            })
            .bind("0.0.0.0:3030") // Changed from 127.0.0.1 to 0.0.0.0
            .unwrap()
            .run()
            .await
        })
    });

    // Run Tauri in the main thread
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
