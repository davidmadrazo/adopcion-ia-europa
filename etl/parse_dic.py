#!/usr/bin/env python3
"""Decodifica los codelists SDMX-ML de Eurostat (descargados en parte2/dic/*.xml).

Por cada dimension:
  - guarda parte2/dic/<dim>.tsv  con  codigo<TAB>etiqueta_en
  - imprime las etiquetas de los codigos que usamos de verdad en el proyecto

Objetivo F0: fijar el significado exacto de cada codigo antes del ETL (F1).
Solo stdlib.
"""
import os
import xml.etree.ElementTree as ET

DIC = os.path.join(os.path.dirname(__file__), "..", "dic")
S = "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/structure}"
C = "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/common}"
LANG = "{http://www.w3.org/XML/1998/namespace}lang"

# codigos que nos interesa inspeccionar de cada dimension
WATCH = {
    "indic_is": lambda c: c.startswith(("E_AI", "E_DI", "I_DSK2")),
    "ind_type": lambda c: c.startswith(("F_", "M_", "IND_")) or c in ("F", "M"),
    "size_emp": lambda c: True,
    "unit": lambda c: True,
    "nace_r2": lambda c: True,
    "geo": lambda c: c in ("EU27_2020", "EA", "ES", "DE", "FR", "IT"),
}


def parse(xmlpath):
    root = ET.parse(xmlpath).getroot()
    out = {}
    for code in root.iter(f"{S}Code"):
        cid = code.get("id")
        label = None
        for n in code.findall(f"{C}Name"):
            if n.get(LANG) == "en":
                label = n.text
        out[cid] = label or ""
    return out


def main():
    for dim, keep in WATCH.items():
        xmlpath = os.path.join(DIC, f"{dim}.xml")
        if not os.path.exists(xmlpath) or os.path.getsize(xmlpath) == 0:
            print(f"!! falta {dim}.xml")
            continue
        codes = parse(xmlpath)
        # guardar tsv completo
        with open(os.path.join(DIC, f"{dim}.tsv"), "w", encoding="utf-8") as f:
            for cid in sorted(codes):
                f.write(f"{cid}\t{codes[cid]}\n")
        watched = {c: l for c, l in codes.items() if keep(c)}
        print("=" * 72)
        print(f"{dim}: {len(codes)} codigos totales | {len(watched)} relevantes")
        for cid in sorted(watched):
            print(f"  {cid:<24} {watched[cid]}")


if __name__ == "__main__":
    main()
