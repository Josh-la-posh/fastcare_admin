import {Link, useLocation, useNavigate} from 'react-router-dom';
import logo from '/images/faslogo.png';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {  MenuIcon} from '../components/ui/icons';
import {
  Ambulance,
  BellIcon,
  ChevronDown,
  ChevronUp,
  HelpCircleIcon,
  HospitalIcon,
  PieChart,
  Settings,
  Share2Icon,
  ShieldCheck,
  // ShieldCheck,
  User2,
  X,
} from 'lucide-react';
import {User} from '@/features/user';
import {cn} from '@/lib/utils';
import {FaMoneyBill} from 'react-icons/fa';
import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/services/store';

type Props = {
  children: React.ReactNode;
  searchBar?: React.ReactNode;
};

export const DashboardLayout = ({children, searchBar}: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = React.useState<string | null>(
    null,
  );

  const toggleDropdown = (name: string, firstChildUrl?: string) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
      if (firstChildUrl) {
        navigate(firstChildUrl); // auto go to first submenu
      }
    }
  };

  const toggleMobileDropdown = (name: string, firstChildUrl?: string) => {
    if (mobileDropdown === name) {
      setMobileDropdown(null);
    } else {
      setMobileDropdown(name);
      if (firstChildUrl) {
        navigate(firstChildUrl); // auto go to first submenu
      }
    }
  };
  const authUser = useSelector((s: RootState) => s.auth.user);
  const isAmbulanceProviderAdmin = authUser?.userRole === 'AmbulanceProviderAdmin';

  const fullMenus = React.useMemo(() => ([
    {
      name: 'DASHBOARD',
      children: [
        // {name: 'Dashboard', icon: <MdDashboard />, url: '/home'},
        {
          name: 'Hospitals',
          icon: <HospitalIcon className='w-5 h-6' />,
          url: '/hospitals',
          children: [
            {name: 'All Hospital', url: '/hospitals/all-hospitals'},
            //{name: 'Hospitals Details', url: '/hospitals/details'},
          ],
        },
        {
          name: 'Doctors',
          icon: <User2 className='w-5 h-6'/>,
          url: '/doctors',
          children: [
            {name: 'All doctor', url: '/doctors/all-doctors'},
            {name: 'Verification request', url: '/doctors/request'},
            // {name: 'Doctor detail', url: '/doctors/doctor-details'},
          ],
        },

        {
          name: 'Reports',
          icon: <PieChart className='w-5 h-6' />,
          url: '/reports',
          // unified reports page with internal tabs, no children needed
          children: [],
        },

        {
          name: 'Transactions',
          icon: <FaMoneyBill className='w-5 h-6' />,
          url: '/transactions',
          children: [
            {name: 'All transaction', url: '/transactions/all-transactions'},
            {name: 'Refunds', url: '/transactions/refunds'},
          ],
        },

        {
          name: 'Ambulance',
          icon: <Ambulance className='w-5 h-6' />,
          url: '/ambulance',
          children: [
            {name: 'Amenities', url: '/ambulance/amenities'},
            {name: 'All Ambulance', url: '/ambulance/all'},
            {name: 'Ambulance providers', url: '/ambulance/providers'},
            {name: 'Ambulance requests', url: '/ambulance/requests'},
            {name: 'Drivers', url: '/ambulance/drivers'},
            {name: 'Responders', url: '/ambulance/responders'},
            {name: 'Responders Note', url: '/ambulance/note'},
            {name: 'Dispatch history', url: '/ambulance/dispatch-history'},
          ],
        },

        {
          name: 'Marketing campaign',
          icon: <Share2Icon className='w-5 h-6' />,
          url: '/marketing-campaign',
          children: [
            {name: 'Ad Campaign', url: '/marketing-campaign'},
            {name: 'Promotional Code', url: '/marketing-campaign/referral-codes'},
          ],
        },

        {
          name: 'Help desk',
          icon: <HelpCircleIcon className='w-5 h-6' />,
          url: '/help-desk',

          children: [
            {name: 'FAQ', url: '/help-desk/faq'},
            {name: 'Tutorials', url: '/help-desk/tutorials'},
            {name: 'Articles', url: '/help-desk/articles'},
            {name: 'User feedback', url: '/help-desk/feedback'},
          ],
        },

        {name: 'Checker', icon: <ShieldCheck className='w-5 h-6' />, url: '/checkers'},

        {name: 'Settings', icon: <Settings className='w-5 h-6' />, url: '/settings'},

        // {
        //   name: 'Enrolees',
        //   icon: <Users />,
        //   url: '/enrolees',
        //   children: [
        //     {name: 'All Enrolees', url: '/enrolees/all-enrolees'},
        //     {name: 'Enrolee Registration', url: '/enrolees/registration'},
        //     {name: 'Enrolee Detail', url: '/enrolees/details/1'},
        //   ],
        // },

        // {
        //   name: 'Payments',
        //   icon: <FaMoneyBill />,
        //   url: '/payments',
        //   children: [
        //     {name: 'Claims', url: '/payments/claims'},
        //     {name: 'Authorization', url: '/payments/authorization'},
        //     {name: 'Tracker', url: '/payments/tracker'},
        //   ],
        // },

        // {name: 'HMO Management', icon: <Settings />, url: '/hmo-management'},
        // {name: 'Settings', icon: <Settings />, url: '/settings'},
      ],
    },
  ]), []);

  const menus = React.useMemo(() => {
    // Start from full set
    let working = fullMenus;

    if (isAmbulanceProviderAdmin) {
      // Restrict top-level sections (previous requirement)
      working = working.map(section => ({
        ...section,
        children: section.children.filter(c => ['Ambulance','Help desk','Settings'].includes(c.name))
      }));
    }

    // Adjust Ambulance submenu entries based on role
    working = working.map(section => ({
      ...section,
      children: section.children.map(child => {
        if (child.name !== 'Ambulance') return child;
        if (!child.children) return child;
        // Filter child.children according to role rules
        const filteredChildren = isAmbulanceProviderAdmin
          ? child.children.filter(sc => sc.name !== 'Ambulance providers') // hide providers for ambulance admin
          : child.children.filter(sc => sc.name === 'Ambulance providers'); // show only providers for others
        return { ...child, children: filteredChildren };
      })
    }));

    return working;
  }, [isAmbulanceProviderAdmin, fullMenus]);

  React.useEffect(() => {
    menus.forEach(menu => {
      menu.children.forEach(child => {
        if (
          child.children?.some(sub => location.pathname.startsWith(sub.url))
        ) {
          setOpenDropdown(child.name); // keep desktop dropdown open
          setMobileDropdown(child.name); // keep mobile dropdown open
        }
      });
    });
  }, [location.pathname, menus]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="bg-[#F9FBFA] relative overflow-scroll pb-24">
        <aside className="hidden lg:flex flex-col justify-between transition-all duration-300 m-3 w-64 h-[calc(100vh-24px)]  bg-[#F9FBFA] rounded-lg px-2 py-4">
          {/* Top Section: Logo, Navigation */}
          <div>
            <div className="flex items-center gap-4 mx-4   mb-12">
              <img src={logo} className="w-48" />
            </div>

            {/* Navigation */}
            <nav className="mt-2">
              {menus.map((menu, index) => (
                <div key={index} className="mt-2.5 space-y-2">
                  {menu.children.map((child, childIndex) => {
                    const isDropdown =
                      child.children && child.children.length > 0;
                    const isActive = location.pathname.startsWith(child.url);

                    return (
                      <div key={childIndex}>
                        <button
                          onClick={() =>
                            isDropdown
                              ? toggleDropdown(
                                  child.name,
                                  child.children?.[0]?.url,
                                ) // pass first submenu url
                              : navigate(child.url)
                          }
                          className={`flex items-center justify-between w-full text-md p-4 rounded-sm ${
                            isActive
                              ? 'text-primary bg-[#E4F1FC] border-l-8 border-primary font-semibold'
                              : 'text-[#88888C]'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            {child.icon}
                            {child.name}
                          </span>
                          {isDropdown && (
                            <span className="text-md">
                              {openDropdown === child.name ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </span>
                          )}
                        </button>

                        {/* Dropdown Items with vertical line */}
                        {isDropdown && openDropdown === child.name && (
                          <div className="relative  ml-5 mt-1 space-y-1">
                            {/* Children links */}

                            <div className="space-y-2">
                              {child.children?.map((sub, subIndex) => {
                                const isActive = location.pathname.startsWith(
                                  sub.url,
                                );
                                return (
                                  <Link
                                    key={subIndex}
                                    to={sub.url}
                                    className={`flex items-center gap-2 text-md p-2 rounded-md transition-colors ${
                                      isActive
                                        ? 'text-primary font-semibold'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                  >
                                    {/* Small circle when active */}
                                    {isActive && (
                                      <span className="w-2 h-2 mr-4 rounded-full bg-primary"></span>
                                    )}
                                    {sub.name}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-200 overflow-hidden">
        <div className="flex items-center justify-between shadow-lg py-5 px-6 bg-white border-gray-200 ">
          <Link to={'/dashboard/home'} className="block lg:hidden">
            <img
              src={logo}
              alt=""
              className="w-28  object-contain"
            />
          </Link>

          {/* Dynamic Title + Search */}
          <div className="hidden lg:flex items-center gap-10 w-full">
            {menus.map(menu =>
              menu.children.map(child => {
                if (location.pathname.startsWith(child.url)) {
                  // check for active sub route
                  const activeChild = child.children?.find(sub =>
                    location.pathname.startsWith(sub.url),
                  );

                  let title = activeChild ? activeChild.name : child.name;

                  // Special case for claim details
                  if (
                    location.pathname.startsWith(
                      '/payments/claims/claims-details',
                    )
                  ) {
                    title = 'Claim Details';
                  }

                  if (
                    location.pathname.startsWith('/payments/auth/auth-details')
                  ) {
                    title = 'Authorization Details';
                  }

                  return (
                    <React.Fragment key={child.url}>
                      <h1 className="text-lg capitalize text-[#11362f] font-semibold">
                        {title}
                      </h1>
                      {searchBar && <div className="px-10">{searchBar}</div>}
                    </React.Fragment>
                  );
                }
                return null;
              }),
            )}
          </div>

          <div className="flex items-center gap-6 lg:mr-14">
            <div className="flex items-center gap-12">
              <BellIcon className="w-6 h-6 hidden lg:block text-gray-600" />
              <User />
            </div>

            {/* Mobile Sidebar */}
            <div className="flex lg:hidden items-center gap-4">
              <Sheet>
                {/* Trigger (Hamburger Icon) */}
                <SheetTrigger className="p-2 rounded-md hover:bg-gray-100 transition">
                  <MenuIcon className="w-6 h-6 text-gray-700" />
                </SheetTrigger>

                {/* Sidebar Content */}
                <SheetContent
                  side="left"
                  className="w-72 p-6 bg-white shadow-lg"
                >
                  <SheetHeader>
                    <div className="flex items-center justify-between h-12 border-b">
                      <SheetTitle>
                        <img
                          src={logo}
                          alt="Logo"
                          className="w-40 object-contain"
                        />
                      </SheetTitle>

                      <SheetClose>
                        <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                      </SheetClose>
                    </div>
                  </SheetHeader>

                  {/* Navigation */}
                  <nav className="space-y-4 mt-6">
                    {menus.map((menu, index) => (
                      <div key={index} className="space-y-2">
                        {menu.children.map((child, childIndex) => {
                          const isDropdown =
                            child.children && child.children.length > 0;
                          const isOpen = mobileDropdown === child.name;

                          return (
                            <div key={childIndex}>
                              {/* Parent */}
                              <button
                                onClick={() =>
                                  isDropdown
                                    ? toggleMobileDropdown(
                                        child.name,
                                        child.children?.[0]?.url,
                                      )
                                    : navigate(child.url)
                                }
                                className="flex items-center justify-between w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                              >
                                <span className="flex items-center gap-2 text-base">
                                  {child.icon}
                                  {child.name}
                                </span>
                                {isDropdown &&
                                  (isOpen ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  ))}
                              </button>

                              {/* Children */}
                              {isDropdown && isOpen && (
                                <div className="ml-6 mt-1 space-y-2 border-l pl-4">
                                  {child.children?.map((sub, subIndex) => (
                                    <Link
                                      key={subIndex}
                                      to={sub.url}
                                      className="block px-2 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-50"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="h-full">{children}</div>
      </main>
    </div>
  );
};

export const Container = ({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('w-full max-w-[1440px] mx-auto ', className)}>
      {children}
    </div>
  );
};
