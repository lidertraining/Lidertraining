export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-am-darker/30 border-t-am"
        role="status"
        aria-label="Carregando"
      />
    </div>
  );
}
