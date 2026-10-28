import React from "react";
import { Empty, Table, TblBox } from "./primitives";

/** Tabella semplice: intestazioni + righe di celle (ReactNode). Se non ci sono righe mostra `empty`. */
export function RTable({
  head,
  rows,
  empty,
  className,
}: {
  head: React.ReactNode[];
  rows: React.ReactNode[][];
  empty?: React.ReactNode;
  className?: string;
}) {
  if (!rows.length) return empty ? <Empty>{empty}</Empty> : null;
  return (
    <TblBox>
      <Table className={className}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </TblBox>
  );
}
