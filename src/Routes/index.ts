import { ComponentType, lazy, LazyExoticComponent } from 'react';
const AppLayout = lazy(() => import('@/layout/AppLayout'));
const NotFound = lazy(() => import('@/pages/OtherPage/NotFound'));
const Forbidden = lazy(() => import('@/pages/OtherPage/Forbidden'));
const SignIn = lazy(() => import('@/pages/AuthPages/SignIn'));
const Home = lazy(() => import('@/pages/Dashboard/Home'));
const Blank = lazy(() => import('@/pages/Blank'));
const UserProfiles = lazy(() => import('@/pages/UserProfiles'));
const DashboardCatalogue = lazy(() => import('@/pages/PartCatalogue/Dashboard'));
const CabinPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Cabin/ManageCabin'));
const CreateCabinPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Cabin/CreateCabin'));
const EditCabinPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Cabin/EditCabin'));
const EnginePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Engine/ManageEngine'));
const CreateEnginePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Engine/Create'));
const EditEnginePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Engine/EditEngine'));
const AxlePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Axle/Manage'));
const CreateAxlePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Axle/Create'));
const EditAxlePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Axle/Edit'));
const TransmissionPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Transmission/Manage'));
const CreateTransmissionPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Transmission/Create'));
const EditTransmissionPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Transmission/Edit'));
const SteeringPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Steering/Manage'));
const CreateSteeringPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Steering/Create'));
const EditSteeringPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Steering/Edit'));
const CreatePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Catalogs/Create'));
const EditPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Catalogs/Edit'));
const ViewPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Catalogs/View'));
const ManagePartCatalogue = lazy(() => import('@/pages/PartCatalogue/Catalogs/Manage'));
const VinPartCatalogue = lazy(() => import('@/pages/PartCatalogue/Vins/Manage'));
const VinCreateCatalogue = lazy(() => import('@/pages/PartCatalogue/Vins/Create'));
const VinViewCatalogue = lazy(() => import('@/pages/PartCatalogue/Vins/View'));
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
        path: '/epc/cabin',
        name: 'Cabin Catalogs',
        isProtected: false,
        roles: ['Cabin Catalogs'],
        component: CabinPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/cabin/create',
        name: 'Cabin Catalogs',
        isProtected: false,
        roles: ['Cabin Catalogs'],
        component: CreateCabinPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/cabin/edit/:cabinId',
        name: 'Cabin Catalogs',
        isProtected: false,
        roles: ['Cabin Catalogs'],
        component: EditCabinPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/engine',
        name: 'Engine Catalogs',
        isProtected: false,
        roles: ['Engine Catalogs'],
        component: EnginePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/engine/create',
        name: 'Engine Catalogs',
        isProtected: false,
        roles: ['Engine Catalogs'],
        component: CreateEnginePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/engine/edit/:engineId',
        name: 'Engine Catalogs',
        isProtected: false,
        roles: ['Engine Catalogs'],
        component: EditEnginePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/axle',
        name: 'Axle Catalogs',
        isProtected: false,
        roles: ['Axle Catalogs'],
        component: AxlePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/axle/create',
        name: 'Axle Catalogs',
        isProtected: false,
        roles: ['Axel Catalogs'],
        component: CreateAxlePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/axle/edit/:axelId',
        name: 'Axle Catalogs',
        isProtected: false,
        roles: ['Axle Catalogs'],
        component: EditAxlePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/transmission',
        name: 'Transmission Catalogs',
        isProtected: false,
        roles: ['Transmission Catalogs'],
        component: TransmissionPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/transmission/create',
        name: 'Transmission Catalogs',
        isProtected: false,
        roles: ['Transmission Catalogs'],
        component: CreateTransmissionPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/transmission/edit/:transmissionId',
        name: 'Transmission Catalogs',
        isProtected: false,
        roles: ['Transmission Catalogs'],
        component: EditTransmissionPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/steering',
        name: 'Steering Catalogs',
        isProtected: false,
        roles: ['Steering Catalogs'],
        component: SteeringPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/steering/create',
        name: 'Steering Catalogs',
        isProtected: false,
        roles: ['Steering Catalogs'],
        component: CreateSteeringPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/steering/edit/:steeringId',
        name: 'Steering Catalogs',
        isProtected: false,
        roles: ['Steering Catalogs'],
        component: EditSteeringPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/manage/create',
        name: 'Manage Catalogs',
        isProtected: false,
        roles: ['Manage Catalogs'],
        component: CreatePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/manage/edit/:id',
        name: 'Edit Catalog',
        isProtected: false,
        roles: ['Manage Catalogs'],
        component: EditPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/manage/view/:id',
        name: 'View Catalog',
        isProtected: false,
        roles: ['Manage Catalogs'],
        component: ViewPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/manage',
        name: 'Manage Catalogs',
        isProtected: false,
        roles: ['Manage Catalogs'],
        component: ManagePartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/vins',
        name: 'Vin Catalogs',
        isProtected: false,
        roles: ['Vin Catalogs'],
        component: VinPartCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/vins/create',
        name: 'Vin Create Catalogs',
        isProtected: false,
        roles: ['Vin Catalogs'],
        component: VinCreateCatalogue,
        layout: AppLayout,
    },
    {
        path: '/epc/vins/view/:vin_id',
        name: 'Vin View Catalogs',
        isProtected: false,
        roles: ['Vin Catalogs'],
        component: VinViewCatalogue,
        layout: AppLayout,
    },
];
