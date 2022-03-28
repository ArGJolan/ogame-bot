# Ogame bot

## Caveats

Download antigame

```
curl -sfLO "https://addons.mozilla.org/firefox/downloads/file/3885382/antigamereborn-7.2.1-an+fx.xpi"
curl -sfLO "https://github.com/aerokube/cm/releases/download/1.8.1/cm_linux_amd64" && chmod +x cm_linux_amd64
./cm_linux_amd64 selenoid start --browsers-json ./config/browsers.json
docker run -d --network selenoid --name selenoid-ui -p 8080:8080 aerokube/selenoid-ui --selenoid-uri http://selenoid:4444
```

VNC in a browser:
