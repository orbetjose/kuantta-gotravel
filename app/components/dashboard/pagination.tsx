interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentItems: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  currentItems,
  onPageChange,
  itemName = "elementos",
}: PaginationProps) {
  const getVisiblePages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 2) {
      return [1, 2, 3, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="font-inter text-sm text-fifth-gray">
        Mostrando {currentItems} de {totalItems} {itemName}
      </p>

      <div className="flex items-center ">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-md px-1 py-2 font-inter text-sm text-fifth-gray hover:bg-inputs disabled:cursor-not-allowed disabled:opacity-40"
        >
          ←
        </button>

        {visiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-1 py-2 font-inter text-sm text-fifth-gray"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`rounded-md px-1 py-2 font-inter text-sm ${
                page === currentPage
                  ? "bg-primary font-bold text-primary-blue"
                  : "text-fifth-gray hover:bg-inputs"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-md px-1 py-2 font-inter text-sm text-fifth-gray hover:bg-inputs disabled:cursor-not-allowed disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  );
}