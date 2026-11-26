#!/usr/bin/env bash
# Tải sẵn mô hình DINOv3 vào models/<id>/ để app (PWA và APK) dùng ngay, không phải tải từ HuggingFace.
# dup.js tự nhận ra thư mục này (./models/<id>/config.json) rồi đọc tại chỗ.
# Chỉ lấy file cần: config, onnx fp32 + fp16 (+ file dữ liệu ngoài nếu có), giấy phép. Bỏ các bản lượng tử hóa khác.
set -euo pipefail

ID="${DINO_ID:-olinesn/dinov3-vits16-lucid}"      # phải trùng DINO_ID trong dup.js
HF="${HF_ENDPOINT:-https://huggingface.co}"
DEST="models/${ID}"
TMP="models/.tmp-$$"

if [ -f "$DEST/.complete" ]; then echo "Mô hình đã có sẵn: $DEST"; exit 0; fi
command -v node >/dev/null || { echo "::error::Thiếu node"; exit 1; }

rm -rf "$TMP"; mkdir -p "$TMP/files"
trap 'rm -rf "$TMP"' EXIT

# Lấy danh sách file thật của repo rồi lọc, khỏi phải ghi cứng tên file
curl -fsSL --retry 4 --retry-delay 3 "$HF/api/models/$ID" -o "$TMP/info.json"
node -e 'JSON.parse(require("fs").readFileSync(process.argv[1]))' "$TMP/info.json" 2>/dev/null || { echo "::error::HuggingFace API không trả về JSON cho $ID (repo riêng tư, bị đổi tên hoặc đang lỗi?)"; exit 1; }
FILES=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1])).siblings.map(s=>s.rfilename).join("\n"))' "$TMP/info.json" \
  | grep -E '^(config\.json|preprocessor_config\.json|LICENSE(\.md|\.txt)?|onnx/model(_fp16)?\.onnx(_data)?)$' || true)

for need in config.json onnx/model.onnx; do
  echo "$FILES" | grep -qx "$need" || { echo "::error::Repo $ID không có $need"; exit 1; }
done

while IFS= read -r f; do
  [ -n "$f" ] || continue
  mkdir -p "$TMP/files/$(dirname "$f")"
  echo "Tải $f"
  curl -fsSL --retry 4 --retry-delay 5 --connect-timeout 20 "$HF/$ID/resolve/main/$f" -o "$TMP/files/$f"
  [ -s "$TMP/files/$f" ] || { echo "::error::$f tải về bị rỗng"; exit 1; }
done <<< "$FILES"

# Kiểm tra trước khi nhận: config phải là JSON, onnx không được là trang lỗi nhỏ xíu
node -e 'JSON.parse(require("fs").readFileSync(process.argv[1]))' "$TMP/files/config.json" || { echo "::error::config.json không phải JSON"; exit 1; }
[ "$(stat -c %s "$TMP/files/onnx/model.onnx")" -gt 100000 ] || { echo "::error::onnx/model.onnx quá nhỏ, có thể tải hỏng"; exit 1; }

# Chỉ khi đủ và đúng mới thay vào chỗ chính thức (không để lại bản dang dở làm app đọc nhầm)
rm -rf "$DEST"; mkdir -p "$(dirname "$DEST")"
mv "$TMP/files" "$DEST"
date -u +%FT%TZ > "$DEST/.complete"
echo "Xong: $(du -sh "$DEST" | cut -f1) trong $DEST"
