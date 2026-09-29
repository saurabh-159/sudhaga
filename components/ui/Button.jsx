export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const styles = {
    primary: 'bg-neutral-950 text-white hover:bg-neutral-800',
    outline: 'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
