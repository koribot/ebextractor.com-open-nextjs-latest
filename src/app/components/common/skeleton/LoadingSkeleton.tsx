interface SkeletonProps {
  width?: number | string
  height?: number | string
  cname?: string
}

export function LoadingSkeleton({ width, height, cname }: SkeletonProps) {
  return <div className={`skeleton ${cname ? cname : ""}`} style={{ width, height }} />
}

export default LoadingSkeleton
