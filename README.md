# ZokaScan

Explorador de Zoka Quantic. Los datos públicos vienen del nodo; las claves de
vista se leen en el navegador y no se mandan a la API, a URLs ni al almacenamiento.

## Claves de vista (rama sin publicar)

My wallet y la búsqueda reconocen las claves completas `zqtestview2` y las de
entrantes `zqtestviewin2`. El scanner detecta el alcance automáticamente.
Las completas conservan saldo, gastos e historial. Las de entrantes muestran
recibos y vuelto marcado, sin inventar un saldo ni una lista de gastos. El
vuelto de billeteras anteriores no está marcado y puede figurar como ingreso;
la pantalla aclara esta limitación.

## Compilar y probar

```sh
npm test
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

El scanner usa `crates/zoka-pq-scan-wasm` del repo del nodo. Para actualizarlo:

```sh
cd <ZOKA>/crates/zoka-pq-scan-wasm
wasm-pack build --release --target web --out-dir pkg --no-pack
cd <zokaexplorer>
npm run update-wasm -- <ZOKA>
```

`src/lib/scan-wasm/SOURCE.txt` registra commit y hashes. Las pruebas ejecutan
ese WASM real con salidas cifradas de cuentas sintéticas (semillas públicas
fijas), además de probar ambas vistas y la cancelación de un escaneo pendiente.
Para regenerar el fixture desde la raíz del nodo:

```sh
cargo run --release --manifest-path crates/zoka-pq-scan-wasm/Cargo.toml --example incoming_fixture -- zokaexplorer/src/test/fixtures/incoming.json
```

Los fixtures no contienen datos de billeteras reales. Compilar no publica el
sitio; el deploy requiere el OK del usuario.
