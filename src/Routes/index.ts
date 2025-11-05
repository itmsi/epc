import { ComponentType, lazy, LazyExoticComponent } from 'react';
const AppLayout = lazy(() => import('@/layout/AppLayout'));
const NotFound = lazy(() => import('@/pages/OtherPage/NotFound'));
const Forbidden = lazy(() => import('@/pages/OtherPage/Forbidden'));
const SignIn = lazy(() => import('@/pages/AuthPages/SignIn'));
const Home = lazy(() => import('@/pages/Dashboard/Home'));
const Blank = lazy(() => import('@/pages/Blank'));
const UserProfiles = lazy(() => import('@/pages/UserProfiles'));
const DashboardCatalogue = lazy(() => import('@/pages/PartCatalogue/Dashboard'));
const CreatePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Catalogs/Create'));
const EditPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Catalogs/Edit'));
const ViewPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Catalogs/View'));
const AddItemsPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Catalogs/AddItems'));
const ManagePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Catalogs/Manage'));
const VinPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Vins/Manage'));
const VinCreateCatalogue = lazy(() => import('@/pages/PartCatalogue/Vins/Create'));
const VinViewCatalogue = lazy(() => import('@/pages/PartCatalogue/Vins/View'));
const MasterCategoryPartCatalogue = lazy(() => import('@/pages/PartCatalogue/MasterCategory/Manage'));
const CreateMasterCategoryPartCatalogue = lazy(() => import('@/pages/PartCatalogue/MasterCategory/Create'));
const ViewMasterCategoryPartCatalogue = lazy(() => import('@/pages/PartCatalogue/MasterCategory/View'));
const CategoryCatalogue = lazy(() => import('@/pages/PartCatalogue/Category/Manage'));
const CreateCategoryCatalogue = lazy(() => import('@/pages/PartCatalogue/Category/Create'));
const ViewCategoryCatalogue = lazy(() => import('@/pages/PartCatalogue/Category/View'));
// PowerBiForm is imported by Create and Edit components, no need to add here

export type TAppRoute = {
    path: string;
    name: string;
    component: LazyExoticComponent<ComponentType<object>> | ComponentType<object>;
    layout?:
        | LazyExoticComponent<ComponentType<{ children: React.ReactNode }>>
        | ComponentType<{ children: React.ReactNode }>;
    isProtected?: boolean;
    isUnProtected?: boolean;
    roles?: string[];
    requiredPermissions?: string[]; // New: required permissions for this route
    subRoutes?: TAppRoute[];
};

export const routes: TAppRoute[] = [
    {
        path: '/',
        name: 'Sign In',
        isUnProtected: true,
        component: SignIn,
    },
    {
        path: '/home',
        name: 'Dashboard',
        roles: ['ADMIN'],
        isProtected: true,
        component: Home,
        layout: AppLayout,
    },
    {
        path: '/blank',
        name: 'Blank Page',
        isProtected: true,
        component: Blank,
        layout: AppLayout,
    },
    {
        path: '/403',
        name: 'Forbidden',
        component: Forbidden,
    },
    {
        path: '*',
        name: 'Not Found',
        component: NotFound,
    },
    {
        path: '/profile',
        name: 'Profile',
        isProtected: true,
        roles: ['ADMIN'],
        component: UserProfiles,
        layout: AppLayout,
    },
    {
        path: '/epc/dashboard',
        name: 'Dashboard Catalogs',
        isProtected: false,
        roles: ['Dashboard Catalogs'],
        component: DashboardCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/manage/create',
        name: 'Manage Catalogs',
        isProtected: true,
        roles: ['Manage Catalogs'],
        component: CreatePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/manage/edit/:id',
        name: 'Manage Catalogs',
        isProtected: true,
        roles: ['Manage Catalogs'],
        component: EditPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/manage/view/:id',
        name: 'Manage Catalogs',
        isProtected: true,
        roles: ['Manage Catalogs'],
        component: ViewPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/manage/:id/add-items',
        name: 'Manage Catalogs',
        isProtected: true,
        roles: ['Manage Catalogs'],
        component: AddItemsPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/manage',
        name: 'Manage Catalogs',
        isProtected: true,
        roles: ['Manage Catalogs'],
        component: ManagePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/vins',
        name: 'Vin Catalogs',
        isProtected: true,
        roles: ['Vin Catalogs'],
        component: VinPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/vins/create',
        name: 'Vin Catalogs',
        isProtected: true,
        roles: ['Vin Catalogs'],
        component: VinCreateCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/vins/view/:vin_id',
        name: 'Vin Catalogs',
        isProtected: true,
        roles: ['Vin Catalogs'],
        component: VinViewCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/master-category',
        name: 'Master Category Catalogs',
        isProtected: true,
        roles: ['Master Category Catalogs'],
        component: MasterCategoryPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/master-category/create',
        name: 'Master Category Catalogs',
        isProtected: true,
        roles: ['Master Category Catalogs'],
        component: CreateMasterCategoryPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/master-category/view/:masterCategoryId',
        name: 'Master Category Catalogs',
        isProtected: true,
        roles: ['Master Category Catalogs'],
        component: ViewMasterCategoryPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/category',
        name: 'Category Catalogs',
        isProtected: true,
        roles: ['Category Catalogs'],
        component: CategoryCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/category/create',
        name: 'Category Catalogs',
        isProtected: true,
        roles: ['Category Catalogs'],
        component: CreateCategoryCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/category/view/:CategoryId',
        name: 'Category Catalogs',
        isProtected: true,
        roles: ['Category Catalogs'],
        component: ViewCategoryCatalogue,
        layout: AppLayout,
    },
];
