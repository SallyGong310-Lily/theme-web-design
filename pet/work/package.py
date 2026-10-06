from pathlib import Path
import hashlib, json, zipfile, xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
required=['index.html','design-desktop-dog.svg','design-desktop-cat.svg','design-desktop-rabbit.svg','design-mobile.svg','assets/dog.svg','assets/cat.svg','assets/rabbit.svg','preview-desktop.png','preview-mobile.png','preview-design.png','README-使用说明.md','verification.json']
assert all((root/name).is_file() and (root/name).stat().st_size for name in required)
report=json.loads((root/'verification.json').read_text())
assert all(t['pass'] for t in report['tests'])
for f in root.rglob('*.svg'): ET.parse(f)
files=sorted(p for p in root.rglob('*') if p.is_file() and p.name not in ['SHA256SUMS.txt','email-receipt.json'])
(root/'SHA256SUMS.txt').write_text('\n'.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(root).as_posix() for p in files)+'\n',encoding='utf-8')
archive=root.parent/'MELLOW-20261004-160346.zip'
assert not archive.exists(), 'Never overwrite an existing package'
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(root.rglob('*')):
        if p.is_file():z.write(p,root.name+'/'+p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    count=len(z.infolist())
print(json.dumps({'zip':str(archive),'bytes':archive.stat().st_size,'files':count,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()},ensure_ascii=True))
