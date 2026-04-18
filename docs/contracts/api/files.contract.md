# Files Contract

## Endpoints

- `POST /api/v1/files/register`
- `POST /api/v1/files/upload`

## `POST /files/register`

Registra metadados de arquivo a partir de um `fileId` ja existente.

### Request

```json
{
  "fileId": "file_abc_123",
  "mimeType": "image/jpeg",
  "originalFileName": "documento.jpg",
  "sizeBytes": 312
}
```

### Response `201`

```json
{
  "status": "ok"
}
```

## `POST /files/upload`

Recebe upload multipart (`file`) e registra metadados, retornando um `fileId` que pode ser usado em `/drivers/me/documents`.

### Content-Type

- `multipart/form-data`

### Response `201`

```json
{
  "status": "ok",
  "fileId": "f74b473e-2f96-4f67-a0cb-bf0a3e3f85f5",
  "mimeType": "image/jpeg",
  "originalFileName": "documento.jpg",
  "sizeBytes": 312
}
```
