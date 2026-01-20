import ActionPlans from './pages/ActionPlans';
import CompanySettings from './pages/CompanySettings';
import Dashboard from './pages/Dashboard';
import DuerpHistory from './pages/DuerpHistory';
import DuerpWizard from './pages/DuerpWizard';
import HazardCatalog from './pages/HazardCatalog';
import Observations from './pages/Observations';
import Onboarding from './pages/Onboarding';
import Users from './pages/Users';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActionPlans": ActionPlans,
    "CompanySettings": CompanySettings,
    "Dashboard": Dashboard,
    "DuerpHistory": DuerpHistory,
    "DuerpWizard": DuerpWizard,
    "HazardCatalog": HazardCatalog,
    "Observations": Observations,
    "Onboarding": Onboarding,
    "Users": Users,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};