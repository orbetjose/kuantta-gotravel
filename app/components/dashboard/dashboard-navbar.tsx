type DashboardNavbarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
    image?: string | null;
  };
};

export default function DashboardNavbar({
  user,
}: DashboardNavbarProps) {
  return (
    <header className="md:px-8 px-2 pt-4 font-inter">
      <div className="h-16 px-4 rounded-3xl flex items-center justify-end lg:justify-between bg-primary-gray">
        {/* Logo */}
        <div className=" items-center hidden lg:flex">
            <img className="md:h-10 h-6 " src="/assets/images/logo_gotravel.png" alt="" />          
        </div>

        {/* Module title */}
        <div className="text-center hidden lg:block">
          <h1 className="text-lg font-bold text-primary-blue">Dashboard</h1>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-primary-blue">{user.name}</p>
            <span className="text-sm text-primary-green font-bold uppercase ">{user.role}</span>
          </div>

          <div className="h-11 w-11 overflow-hidden rounded-full bg-primary-green ">
            <img
              src="/assets/images/ico-user.png"
              alt="Juan Pérez"
              className="object-cover p-2"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
