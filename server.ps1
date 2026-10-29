# Servidor nativo de Windows para alojar e instalar la PWA
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🌾 ¡La Granja del Saber está lista para instalar!" -ForegroundColor Yellow
Write-Host "👉 Abriendo en: http://localhost:$port/" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

Start-Process "http://localhost:$port/"

$root = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/" -or [string]::IsNullOrEmpty($localPath)) { 
            $localPath = "/index.html" 
        }
        $cleanPath = $localPath.TrimStart('/').Replace('/', '\')
        $filePath = Join-Path $root $cleanPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".png"  { "image/png" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $mime
            $response.Headers.Add("Service-Worker-Allowed", "/")
            $response.Headers.Add("Cache-Control", "no-cache")
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.Close($bytes, $false)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("Archivo no encontrado")
            $response.Close($msg, $false)
        }
    } catch {
        # Si un cliente cancela o refresca la peticion, continuar con el siguiente
    }
}
