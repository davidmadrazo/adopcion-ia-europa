#!/usr/bin/env python3
"""Auditoria F0 - Parte II Visualizacion UOC.

Lee los 4 TSV de Eurostat (formato ancho, dimensiones empaquetadas en la
primera columna) y reporta, sin modificar nada:
  - dimensiones y anios de cada tabla
  - valores unicos de cada dimension categorica
  - disponibilidad de datos (celdas no-missing) por anio
  - flags de calidad presentes (b = ruptura serie, u = baja fiabilidad, ...)

Objetivo: validar que existen de verdad los cortes que promete la Parte I
(genero M/F, tamano empresa, sectores, tipos de IA, anios) antes de construir.
Solo stdlib.
"""
import os
from collections import defaultdict

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
FILES = ["isoc_eb_ain2.tsv", "isoc_sk_dskl_i21.tsv", "isoc_eb_ai.tsv", "isoc_e_dii.tsv"]


def clean(token):
    """'19.37 b' -> ('19.37','b'); ': u' -> (':','u'); '' -> (':','')"""
    t = token.strip()
    if not t:
        return ":", ""
    parts = t.split()
    val = parts[0]
    flag = parts[1] if len(parts) > 1 else ""
    return val, flag


def audit(path):
    with open(path, encoding="utf-8") as f:
        header = f.readline().rstrip("\n")
        left, _, right = header.partition("\t")
        dims = left.split("\\")[0].split(",")
        years = [y.strip() for y in right.split("\t")]
        uniq = defaultdict(set)
        avail = {y: 0 for y in years}
        total = 0
        flags = set()
        for line in f:
            line = line.rstrip("\n")
            if not line:
                continue
            cells = line.split("\t")
            for d, v in zip(dims, cells[0].split(",")):
                uniq[d].add(v)
            total += 1
            for i, y in enumerate(years):
                idx = i + 1
                if idx < len(cells):
                    val, flag = clean(cells[idx])
                    if flag:
                        flags.add(flag)
                    if val != ":":
                        avail[y] += 1
    return dims, years, uniq, avail, total, flags


def main():
    for fn in FILES:
        path = os.path.join(DATA_DIR, fn)
        if not os.path.exists(path):
            print(f"!! NO EXISTE: {path}")
            continue
        dims, years, uniq, avail, total, flags = audit(path)
        print("=" * 72)
        print(f"{fn}  -  {total} filas de datos")
        print(f"  Dimensiones: {dims}")
        print(f"  Anios: {years}")
        print("  Disponibilidad por anio (no-missing / total):")
        for y in years:
            pct = 100 * avail[y] / total if total else 0
            print(f"    {y}: {avail[y]:>7} / {total} ({pct:4.1f}%)")
        print(f"  Flags presentes: {sorted(flags)}")
        for d in dims:
            vals = sorted(uniq[d])
            if d == "geo":
                print(f"  geo ({len(vals)}): {vals}")
            elif len(vals) <= 60:
                print(f"  {d} ({len(vals)}): {vals}")
            else:
                print(f"  {d} ({len(vals)}, muestro 40): {vals[:40]}")


if __name__ == "__main__":
    main()
