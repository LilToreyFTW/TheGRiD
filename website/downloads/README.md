# GRiD Game EXE Download Server

This file will be created automatically when you build the EXE.

## To Build EXE:

```bash
npm run build:exe
```

## After Building:

1. Copy the EXE from `dist/` to `website/downloads/`
2. Rename to `GRiD-Setup.exe`
3. The website will serve it automatically

## File Structure:

```
website/
├── downloads/
│   └── GRiD-Setup.exe  ← Place EXE here after building
├── index.html
├── css/
└── js/
```

