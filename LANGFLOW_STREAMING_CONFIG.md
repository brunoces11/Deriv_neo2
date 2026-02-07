# 🔧 Configuração de Streaming no Langflow

## Status Atual
✅ **Frontend está funcionando perfeitamente**
❌ **Langflow não está retornando streaming**

## Diagnóstico dos Logs

### O que está acontecendo:
```
[LangflowAPI-STREAM] ✅ Response received, Content-Type: application/json
[LangflowAPI-STREAM] ⚠️ Response is not streaming, falling back to regular parsing
```

**Tradução**: O Langflow está retornando a resposta completa de uma vez (`application/json`) em vez de enviar em chunks progressivos (`text/event-stream`).

## 🎯 Como Habilitar Streaming no Langflow

### Opção 1: Verificar se o endpoint suporta streaming

O endpoint atual é:
```
https://lf142.prompt-master.org/api/v1/run/b313a26a-92a8-4f55-9084-a6cf640203eb
```

**Possíveis endpoints de streaming no Langflow:**
- `/api/v1/run/{flow_id}` com parâmetro `stream=true` ✅ (você já está enviando)
- `/api/v1/run/{flow_id}/stream` (endpoint específico de streaming)
- `/api/v1/chat/{flow_id}` com `stream=true`

### Opção 2: Configurar o Flow no Langflow

No Langflow UI, você precisa:

1. **Abrir o flow** que está sendo usado
2. **Localizar o componente de Output** (geralmente "Chat Output" ou "Text Output")
3. **Habilitar a opção "Stream"** ou "Enable Streaming"
4. **Salvar e fazer deploy** do flow

### Opção 3: Verificar a versão do Langflow

Streaming pode não estar disponível em versões antigas do Langflow. Verifique:
- Versão mínima recomendada: **Langflow 1.0+**
- Se estiver usando versão antiga, considere atualizar

## 🔍 Como Testar se o Langflow Suporta Streaming

### Teste 1: cURL com streaming
```bash
curl -X POST "https://lf142.prompt-master.org/api/v1/run/b313a26a-92a8-4f55-9084-a6cf640203eb" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "input_value": "teste",
    "session_id": "test-session",
    "stream": true
  }' \
  --no-buffer
```

**O que procurar:**
- ✅ Se retornar chunks progressivos com `data: {...}`, streaming está funcionando
- ❌ Se retornar JSON completo de uma vez, streaming não está habilitado

### Teste 2: Verificar headers da resposta
No console do navegador, após enviar uma mensagem, procure por:
```
Content-Type: text/event-stream  ← Streaming ativo
Content-Type: application/json   ← Streaming NÃO ativo
```

## 🚀 Alternativas Enquanto Streaming Não Está Disponível

### Opção A: Usar o fallback atual (já implementado)
O código já tem um fallback que funciona:
```javascript
if (!contentType?.includes('text/event-stream')) {
  console.warn('[LangflowAPI-STREAM] ⚠️ Response is not streaming, falling back to regular parsing');
  const data = await response.json();
  // ... processa resposta completa
  onChunk(rawText, true);
  return;
}
```

**Resultado**: A resposta chega completa de uma vez, mas o sistema funciona normalmente.

### Opção B: Simular streaming no frontend (chunking artificial)
Se o Langflow não suportar streaming, podemos simular no frontend:

```javascript
// Dividir texto em chunks e enviar progressivamente
const words = rawText.split(' ');
let accumulated = '';
for (let i = 0; i < words.length; i++) {
  accumulated += words[i] + ' ';
  onChunk(accumulated, i === words.length - 1);
  await new Promise(resolve => setTimeout(resolve, 50)); // 50ms entre palavras
}
```

**Vantagem**: Cria efeito visual de streaming mesmo sem suporte do backend
**Desvantagem**: Não é streaming real, apenas simulação

## 📊 Comparação: Com vs Sem Streaming

### ✅ Com Streaming (ideal):
- Texto aparece palavra por palavra em tempo real
- Usuário vê progresso imediato
- Melhor experiência (parece mais "vivo")
- Cards aparecem assim que detectados no stream

### ⚠️ Sem Streaming (atual):
- Texto aparece completo de uma vez
- Pequeno delay antes de aparecer
- Funciona perfeitamente, mas menos "fluido"
- Cards aparecem após texto completo

## 🎯 Próximos Passos

### Passo 1: Verificar com a equipe do Langflow
- Confirmar se o endpoint suporta streaming
- Verificar se há configuração necessária no flow
- Verificar versão do Langflow

### Passo 2: Testar endpoint alternativo (se disponível)
Se houver endpoint específico de streaming, testar:
```
https://lf142.prompt-master.org/api/v1/run/{flow_id}/stream
```

### Passo 3: Implementar chunking artificial (opcional)
Se streaming não estiver disponível e você quiser o efeito visual, posso implementar o chunking artificial no frontend.

## 💡 Recomendação

**Para agora**: Continue usando o sistema como está. O fallback funciona perfeitamente e a experiência do usuário é boa.

**Para o futuro**: Quando o Langflow tiver streaming habilitado, o código frontend já está pronto e vai funcionar automaticamente sem mudanças.

## 🐛 Erro Secundário Detectado

Há um erro não relacionado ao streaming:
```
Error adding execution: Could not find the 'frontend_id' column of 'chat_executions' in the schema cache
```

**Causa**: A tabela `chat_executions` no Supabase não tem a coluna `frontend_id`.

**Solução**: Você precisa adicionar essa coluna ao schema do Supabase ou remover a referência no código.

Quer que eu corrija esse erro também?
