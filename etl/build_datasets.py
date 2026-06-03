#!/usr/bin/env python3
"""F1 - ETL de los 4 TSV de Eurostat a datasets tidy para la visualizacion.

Pasos:
  1. Lee cada TSV (formato ancho, dims empaquetadas), pivota ancho->largo.
  2. Separa valor numerico y flag de calidad; ':' -> NaN.
  3. Filtra a UE-27 (+ agregado EU27_2020) y a los codigos relevantes.
  4. Decodifica codigos a etiquetas legibles.
  5. Escribe 5 CSV en parte2/datasets/.
  6. Imprime un 'vistazo' a los numeros para validar la narrativa.

Codigos verificados en F0 (ver F0-hallazgos.md). Requiere pandas.
"""
import os
import numpy as np
import pandas as pd

ETL = os.path.dirname(__file__)
BASE = os.path.join(ETL, "..")
DATA = os.path.join(BASE, "..", "data")
DIC = os.path.join(BASE, "dic")
OUT = os.path.join(BASE, "datasets")
os.makedirs(OUT, exist_ok=True)

UE27 = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "EL",
        "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
        "SI", "ES", "SE"]
KEEP_GEO = set(UE27 + ["EU27_2020"])

TECH = {
    "E_AI_TANY": "Cualquier IA",
    "E_AI_TML": "Machine learning",
    "E_AI_TTM": "Mineria de texto",
    "E_AI_TSR": "Reconocimiento de voz",
    "E_AI_TNLG": "Generacion de lenguaje",
    "E_AI_TPVSG": "Generacion de imagen/audio",
    "E_AI_TIR": "Vision por computador",
    "E_AI_TPA": "Automatizacion de procesos",
    "E_AI_TAR": "Robots autonomos",
}
SIZE = {
    "GE10": ">=10 (total)", "0-9": "Micro (0-9)", "10-49": "Pequenas (10-49)",
    "50-249": "Medianas (50-249)", "GE250": "Grandes (>=250)",
}
IND_LABEL = {
    "IND_TOTAL": ("Total", "16-74"), "M_Y16_74": ("Hombres", "16-74"),
    "F_Y16_74": ("Mujeres", "16-74"), "M_I5_8": ("Hombres", "Educacion alta"),
    "F_I5_8": ("Mujeres", "Educacion alta"), "M_I0_2": ("Hombres", "Educacion baja"),
    "F_I0_2": ("Mujeres", "Educacion baja"), "M_I3_4": ("Hombres", "Educacion media"),
    "F_I3_4": ("Mujeres", "Educacion media"),
}
SKILL = {"I_DSK2_AB": "Por encima de basicas", "I_DSK2_B": "Basicas"}


def load_dic(name):
    out = {}
    with open(os.path.join(DIC, f"{name}.tsv"), encoding="utf-8") as f:
        for line in f:
            p = line.rstrip("\n").split("\t")
            if len(p) >= 2:
                out[p[0]] = p[1]
    return out


def load_long(fn, dim_names):
    df = pd.read_csv(os.path.join(DATA, fn), sep="\t", dtype=str)
    first = df.columns[0]
    dims = df[first].str.split(",", expand=True)
    dims.columns = dim_names
    years = [c for c in df.columns if c != first]
    vals = df[years].copy()
    vals.columns = [c.strip() for c in years]
    wide = pd.concat([dims, vals], axis=1)
    long = wide.melt(id_vars=dim_names, var_name="anio", value_name="raw")
    parts = long["raw"].fillna("").str.strip().str.split(n=1, expand=True)
    if parts.shape[1] == 1:
        parts[1] = np.nan
    long["pct"] = pd.to_numeric(parts[0].replace({":": np.nan, "": np.nan}), errors="coerce")
    long["flag"] = parts[1]
    long["anio"] = long["anio"].astype(int)
    return long


def main():
    nace_dic = load_dic("nace_r2")

    # --- 1. Adopcion nacional (eb_ai, total economia, >=10 empleados) ---
    ebai = load_long("isoc_eb_ai.tsv", ["freq", "size_emp", "nace_r2", "indic_is", "unit", "geo"])
    base = ebai[(ebai.nace_r2 == "C10-S951_X_K") & (ebai.unit == "PC_ENT") & (ebai.geo.isin(KEEP_GEO))]

    nac = base[(base.size_emp == "GE10") & (base.indic_is.isin(TECH))].copy()
    nac["tecnologia"] = nac.indic_is.map(TECH)
    nac = nac.rename(columns={"geo": "pais", "indic_is": "tecnologia_cod"})
    nac[["pais", "anio", "tecnologia_cod", "tecnologia", "pct", "flag"]].to_csv(
        os.path.join(OUT, "adopcion_nacional.csv"), index=False, encoding="utf-8")

    # --- 2. Adopcion por tamano (eb_ai, E_AI_TANY) ---
    tam = base[(base.indic_is == "E_AI_TANY") & (base.size_emp.isin(SIZE))].copy()
    tam["size_label"] = tam.size_emp.map(SIZE)
    tam = tam.rename(columns={"geo": "pais"})
    tam[["pais", "anio", "size_emp", "size_label", "pct", "flag"]].to_csv(
        os.path.join(OUT, "adopcion_tamano.csv"), index=False, encoding="utf-8")

    # --- 3. Adopcion por sector (ain2, >=10 empleados) ---
    ain2 = load_long("isoc_eb_ain2.tsv", ["freq", "size_emp", "nace_r2", "indic_is", "unit", "geo"])
    sec = ain2[(ain2.size_emp == "GE10") & (ain2.unit == "PC_ENT")
               & (ain2.indic_is.isin(TECH)) & (ain2.geo.isin(KEEP_GEO))].copy()
    sec["tecnologia"] = sec.indic_is.map(TECH)
    sec["sector"] = sec.nace_r2.map(nace_dic)
    sec = sec.rename(columns={"geo": "pais", "nace_r2": "sector_cod", "indic_is": "tecnologia_cod"})
    sec[["pais", "anio", "sector_cod", "sector", "tecnologia_cod", "tecnologia", "pct", "flag"]].to_csv(
        os.path.join(OUT, "adopcion_sector.csv"), index=False, encoding="utf-8")

    # Version reducida para el explorador: ~10 secciones NACE representativas
    # (evita cargar los 6 MB del fichero completo). Las etiquetas en espanol se
    # aplican en el front (theme.ts SECTOR_LABELS).
    TOP_SECTORS = ["C", "D_E", "F", "G", "H", "I", "J", "L", "M", "N"]
    top = sec[sec.sector_cod.isin(TOP_SECTORS)].copy()
    top[["pais", "anio", "sector_cod", "sector", "tecnologia_cod", "tecnologia", "pct", "flag"]].to_csv(
        os.path.join(OUT, "adopcion_sector_top.csv"), index=False, encoding="utf-8")

    # --- 4. Habilidades digitales (sk, por encima de basicas / basicas) ---
    sk = load_long("isoc_sk_dskl_i21.tsv", ["freq", "ind_type", "indic_is", "unit", "geo"])
    hab = sk[(sk.unit == "PC_IND") & (sk.indic_is.isin(SKILL))
             & (sk.ind_type.isin(IND_LABEL)) & (sk.geo.isin(KEEP_GEO))].copy()
    hab["sexo"] = hab.ind_type.map(lambda c: IND_LABEL[c][0])
    hab["grupo"] = hab.ind_type.map(lambda c: IND_LABEL[c][1])
    hab["indicador"] = hab.indic_is.map(SKILL)
    hab = hab.rename(columns={"geo": "pais"})
    hab[["pais", "anio", "ind_type", "sexo", "grupo", "indic_is", "indicador", "pct", "flag"]].to_csv(
        os.path.join(OUT, "habilidades.csv"), index=False, encoding="utf-8")

    # --- 5. Metricas derivadas por pais-anio ---
    ia = (nac[nac.tecnologia_cod == "E_AI_TANY"][["pais", "anio", "pct"]]
          .rename(columns={"pct": "adopcion_ia"}).set_index(["pais", "anio"]))
    tp = tam.pivot_table(index=["pais", "anio"], columns="size_emp", values="pct", aggfunc="mean")
    brecha_tam = (tp.get("GE250") - tp.get("10-49")).rename("brecha_tamano")
    habab = hab[hab.indic_is == "I_DSK2_AB"]
    hpv = habab.pivot_table(index=["pais", "anio"], columns="ind_type", values="pct", aggfunc="mean")
    hab_total = hpv.get("IND_TOTAL").rename("hab_avanzada_total")
    brecha_gen = (hpv.get("M_Y16_74") - hpv.get("F_Y16_74")).rename("brecha_genero_hab")

    m = ia.join([brecha_tam, hab_total, brecha_gen]).reset_index()

    # delta de adopcion 2023->2025 por pais
    piv_ia = ia.reset_index().pivot_table(index="pais", columns="anio", values="adopcion_ia")
    if 2023 in piv_ia.columns and 2025 in piv_ia.columns:
        delta = (piv_ia[2025] - piv_ia[2023]).rename("delta_ia_2325")
        m = m.merge(delta.reset_index(), on="pais", how="left")

    # gap oferta-demanda: z(adopcion) - z(hab_total), por anio sobre UE-27
    def z_by_year(frame, col):
        sub = frame[frame.pais.isin(UE27)]
        return sub.groupby("anio")[col].transform(lambda s: (s - s.mean()) / s.std())

    m["z_oferta"] = z_by_year(m, "adopcion_ia")
    m["z_demanda"] = z_by_year(m, "hab_avanzada_total")
    m["gap_oferta_demanda"] = m["z_oferta"] - m["z_demanda"]
    m.to_csv(os.path.join(OUT, "metricas_pais_anio.csv"), index=False, encoding="utf-8")

    # --- 6. Vistazo a los numeros ---
    print("=" * 72)
    print("DATASETS GENERADOS en parte2/datasets/")
    for f in ["adopcion_nacional", "adopcion_tamano", "adopcion_sector", "habilidades", "metricas_pais_anio"]:
        n = len(pd.read_csv(os.path.join(OUT, f + ".csv")))
        print(f"  {f}.csv: {n} filas")

    print("\n" + "=" * 72)
    print("P1 - Adopcion de IA 2025 (>=10 empleados), ranking UE-27")
    r25 = (nac[(nac.tecnologia_cod == "E_AI_TANY") & (nac.anio == 2025) & (nac.pais.isin(UE27))]
           .dropna(subset=["pct"]).sort_values("pct", ascending=False))
    for i, (_, row) in enumerate(r25.iterrows(), 1):
        mark = "  <-- ESPANA" if row.pais == "ES" else ""
        print(f"  {i:>2}. {row.pais}  {row.pct:5.1f}%{mark}")
    eu = nac[(nac.tecnologia_cod == "E_AI_TANY") & (nac.anio == 2025) & (nac.pais == "EU27_2020")]
    if len(eu):
        print(f"  UE-27 (agregado): {eu.iloc[0].pct:.1f}%")

    print("\n" + "=" * 72)
    print("P3 - Brecha por tamano 2025 (Grandes >=250  vs  Pequenas 10-49), pp")
    bt = m[(m.anio == 2025) & (m.pais.isin(UE27))].dropna(subset=["brecha_tamano"])
    print(f"  media UE-27: {bt.brecha_tamano.mean():.1f} pp | min {bt.brecha_tamano.min():.1f} | max {bt.brecha_tamano.max():.1f}")
    es = m[(m.anio == 2025) & (m.pais == "ES")]
    if len(es):
        print(f"  Espana: brecha_tamano={es.iloc[0].brecha_tamano:.1f} pp | brecha_genero={es.iloc[0].brecha_genero_hab:.1f} pp")

    print("\n" + "=" * 72)
    print("P4 - Brecha de genero en habilidades avanzadas 2025 (Hombres - Mujeres), pp")
    bg = m[(m.anio == 2025) & (m.pais.isin(UE27))].dropna(subset=["brecha_genero_hab"])
    print(f"  media UE-27: {bg.brecha_genero_hab.mean():.1f} pp | min {bg.brecha_genero_hab.min():.1f} | max {bg.brecha_genero_hab.max():.1f}")
    corr = m[(m.anio == 2025) & (m.pais.isin(UE27))][["adopcion_ia", "hab_avanzada_total"]].corr().iloc[0, 1]
    print(f"  Correlacion adopcion_ia vs habilidades_avanzadas (2025): r = {corr:.2f}")

    print("\n" + "=" * 72)
    print("Efecto generativa: % empresas con generacion de lenguaje (TNLG) por anio, UE-27")
    gen = nac[(nac.tecnologia_cod == "E_AI_TNLG") & (nac.pais == "EU27_2020")].sort_values("anio")
    for _, row in gen.iterrows():
        v = f"{row.pct:.1f}%" if pd.notna(row.pct) else "s/d"
        print(f"  {row.anio}: {v}")


if __name__ == "__main__":
    main()
