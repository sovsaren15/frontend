import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useRouteTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Admin Routes
    if (path.includes("/admin/dashboard")) document.title = "Dashboard | Admin";
    else if (path.includes("/admin/schools/create")) document.title = "Create School | Admin";
    else if (path.includes("/admin/schools/update")) document.title = "Update School | Admin";
    else if (path.includes("/admin/schools/view")) document.title = "School Details | Admin";
    else if (path.includes("/admin/schools")) document.title = "Manage Schools | Admin";
    else if (path.includes("/admin/principals/create")) document.title = "Create Principal | Admin";
    else if (path.includes("/admin/principals/update")) document.title = "Update Principal | Admin";
    else if (path.includes("/admin/principals")) document.title = "Manage Principals | Admin";
    else if (path.includes("/admin/teachers")) document.title = "Manage Teachers | Admin";
    else if (path.includes("/admin/students")) document.title = "Manage Students | Admin";

    // Principal Routes
    else if (path.includes("/principal/dashboard")) document.title = "Dashboard | Principal";
    else if (path.includes("/principal/schools")) document.title = "School Information | Principal";
    else if (path.includes("/principal/events")) document.title = "Events | Principal";
    else if (path.includes("/principal/teachers/create")) document.title = "Create Teacher | Principal";
    else if (path.includes("/principal/teachers")) document.title = "Manage Teachers | Principal";
    else if (path.includes("/principal/students/create")) document.title = "Register Student | Principal";
    else if (path.includes("/principal/students")) document.title = "Manage Students | Principal";
    else if (path.includes("/principal/classes/create")) document.title = "Create Class | Principal";
    else if (path.includes("/principal/classes")) document.title = "Manage Classes | Principal";
    else if (path.includes("/principal/results")) document.title = "Study Results | Principal";
    else if (path.includes("/principal/attendance")) document.title = "Attendance | Principal";
    else if (path.includes("/principal/subjects/create")) document.title = "Create Subject | Principal";
    else if (path.includes("/principal/subjects")) document.title = "Manage Subjects | Principal";
    else if (path.includes("/principal/profile")) document.title = "Profile | Principal";

    // Teacher Routes
    else if (path.includes("/teacher/dashboard")) document.title = "Dashboard | Teacher";
    else if (path.includes("/teacher/schools")) document.title = "School Information | Teacher";
    else if (path.includes("/teacher/events")) document.title = "Events | Teacher";
    else if (path.includes("/teacher/classes")) document.title = "Classes | Teacher";
    else if (path.includes("/teacher/students")) document.title = "Students | Teacher";
    else if (path.includes("/teacher/attendance")) document.title = "Attendance | Teacher";
    else if (path.includes("/teacher/scores")) document.title = "Scores | Teacher";
    else if (path.includes("/teacher/results")) document.title = "Results | Teacher";
    else if (path.includes("/teacher/profile")) document.title = "Profile | Teacher";

    // Default
    else document.title = "Primary School Attendance";
  }, [location]);
};

export default useRouteTitle;