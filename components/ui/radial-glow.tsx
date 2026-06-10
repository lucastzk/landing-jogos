import type { CSSProperties } from "react";

type RadialGlowProps = {
  /** Cor central do brilho — qualquer cor CSS, de preferência com alfa (transparência). */
  color?: string;
  /** Raio do brilho. Ex.: "560px", "40rem". */
  size?: string;
  /** Centro do brilho dentro da seção. Ex.: "50% 0%", "50% 120px", "80% 30%". */
  position?: string;
  /** Classes extras (opcional). */
  className?: string;
  style?: CSSProperties;
};

/**
 * Brilho radial ambiente para o fundo de uma seção.
 *
 * Uso: deixe a seção como `relative isolate overflow-hidden` e renderize
 * <RadialGlow /> como primeiro filho. Ele fica atrás do conteúdo (-z-10),
 * é puramente decorativo e não captura cliques.
 */
export default function RadialGlow({
  color = "rgba(240, 16, 16, 0.18)",
  size = "560px",
  position = "50% 0%",
  className = "",
  style,
}: RadialGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle ${size} at ${position}, ${color}, transparent)`,
        ...style,
      }}
    />
  );
}
