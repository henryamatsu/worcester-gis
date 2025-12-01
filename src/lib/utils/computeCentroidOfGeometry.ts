export function computeCentroidOfGeometry(
  geom: GeoJSON.Geometry
): [number, number] {
  // Proper area-weighted centroid for Polygon / MultiPolygon
  // Uses the usual shoelace formula on each ring, then combines.

  function centroidOfRing(coords: number[][]): {
    cx: number;
    cy: number;
    area: number;
  } {
    let area = 0;
    let cx = 0;
    let cy = 0;

    const n = coords.length;
    if (n < 3) return { cx: 0, cy: 0, area: 0 };

    for (let i = 0; i < n; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[(i + 1) % n];
      const cross = x1 * y2 - x2 * y1;
      area += cross;
      cx += (x1 + x2) * cross;
      cy += (y1 + y2) * cross;
    }

    area *= 0.5;
    if (area === 0) {
      return { cx: coords[0][0], cy: coords[0][1], area: 0 };
    }

    cx /= 6 * area;
    cy /= 6 * area;
    return { cx, cy, area };
  }

  function centroidOfPolygon(rings: number[][][]): [number, number] {
    // First ring is outer, others are holes. Holes get subtracted by area sign.
    let totalArea = 0;
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < rings.length; i++) {
      const { cx, cy, area } = centroidOfRing(rings[i]);
      if (!isFinite(cx) || !isFinite(cy)) continue;
      totalArea += area;
      sumX += cx * area;
      sumY += cy * area;
    }

    if (totalArea === 0) {
      // fallback: average vertices of the outer ring
      const outer = rings[0];
      let sx = 0,
        sy = 0;
      for (const [x, y] of outer) {
        sx += x;
        sy += y;
      }
      return [sx / outer.length, sy / outer.length];
    }

    return [sumX / totalArea, sumY / totalArea];
  }

  if (geom.type === "Polygon") {
    const rings = geom.coordinates as number[][][];
    return centroidOfPolygon(rings);
  }

  if (geom.type === "MultiPolygon") {
    const polys = geom.coordinates as number[][][][];
    let totalArea = 0;
    let sumX = 0;
    let sumY = 0;

    for (const rings of polys) {
      const polyCentroid = centroidOfPolygon(rings);
      // recompute area for the polygon so we can weight it
      const { area } = centroidOfRing(rings[0]);
      const a = area || 0;
      totalArea += a;
      sumX += polyCentroid[0] * a;
      sumY += polyCentroid[1] * a;
    }

    if (totalArea === 0) {
      // fallback: average centroids of each polygon
      let count = 0;
      let sx = 0,
        sy = 0;
      for (const rings of polys) {
        const [cx, cy] = centroidOfPolygon(rings);
        sx += cx;
        sy += cy;
        count++;
      }
      return count ? [sx / count, sy / count] : [0, 0];
    }

    return [sumX / totalArea, sumY / totalArea];
  }

  if (geom.type === "Point") {
    const p = geom.coordinates as number[];
    return [p[0], p[1]];
  }

  // For LineString / MultiLineString etc., just average coordinates
  const pts: [number, number][] = [];
  if (geom.type === "LineString") {
    for (const c of geom.coordinates as number[][]) pts.push([c[0], c[1]]);
  } else if (geom.type === "MultiLineString") {
    for (const line of geom.coordinates as number[][][]) {
      for (const c of line) pts.push([c[0], c[1]]);
    }
  }

  if (pts.length === 0) return [0, 0];

  let sx = 0,
    sy = 0;
  for (const [x, y] of pts) {
    sx += x;
    sy += y;
  }
  return [sx / pts.length, sy / pts.length];
}
