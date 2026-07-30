export function renderErrorPage(error?: unknown): string {
  const details = error
    ? error instanceof Error
      ? `${error.message}\n${error.stack || ""}`
      : typeof error === "object"
        ? JSON.stringify(error, null, 2)
        : String(error)
    : "Consulte os logs do servidor para mais detalhes.";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Erro de Renderização - Studio Júlia Gatti</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 42rem; width: 100%; text-align: left; padding: 2rem; background: #fff; border-radius: 1rem; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; color: #ef4444; }
      p { color: #4b5563; margin: 0 0 1rem; font-size: 0.875rem; }
      pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-size: 0.75rem; color: #dc2626; white-space: pre-wrap; word-break: break-all; max-height: 300px; }
      .actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.5rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #F87171; color: #fff; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Erro no Servidor (SSR)</h1>
      <p>Detalhes técnicos da exceção capturada no servidor:</p>
      <pre>${details}</pre>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Tentar novamente</button>
      </div>
    </div>
  </body>
</html>`;
}
