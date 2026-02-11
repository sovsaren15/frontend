import { Outlet, Route, Routes } from "react-router-dom";

//teacher 
import ProfileTeacherChangePassword from "./pages-teacher/profile/ProfileTeacherChangePassword.jsx";
import ProfileDetailViewTeacher from "./pages-teacher/profile/ProfileDetailViewTeacher.jsx";
import CreateSudentTeacherPages from "./pages-teacher/student/CreateSudentTeacherPages.jsx";
import StudentTeacherPages from "./pages-teacher/student/StudentTeacherPages.jsx";
import ScoreTeacherPage from "./pages-teacher/score/ScoreTeacherPage.jsx";
import ScoreReportTeacherPage from "./pages-teacher/score/ScoreReportTeacherPage.jsx";
import AttendanceTeacherPage from "./pages-teacher/attendance/AttendanceTeacherPage.jsx";
import ClassTeacherPage from "./pages-teacher/class/ClassTeacherPage.jsx";
import ResultTeacherPage from "./pages-teacher/result/ResultTeacherPage.jsx";
import DashboardPageTeacher from "./pages-teacher/DashboardPageTeacher";
import MainLayoutTeacher from "./component/layout/MainLayoutTeacher";
import ClassDetailViewTeacherPage from "./pages-teacher/class/ClassDetailViewTeacherPage";
import AttendanceDataTeacherPage from "./pages-teacher/attendance/AttendanceDataTeacherPage.jsx";
import StudentDetailViewTeacher from "./pages-teacher/student/StudentDetailViewTeacher.jsx";

//principal
import TeacherDetailViewPrincipal from "./pages-principal/teacher/TeacherDetailViewPrincipal.jsx";
import EventViewdetailPrincipalPage from "./pages-principal/event/EventViewdetailPrincipalPage.jsx";
import CreateSudentPrincipalPages from "./pages-principal/student/CreateSudentPrincipalPages.jsx";
import StudentDetailViewPrincipal from "./pages-principal/student/StudentDetailViewPrincipal.jsx";
import StudentPrincipalPages from "./pages-principal/student/StudentPrincipalPages.jsx";
import AttendancePrincipalPage from "./pages-principal/Stady/AttendancePrincipalPage.jsx";
import ResultPrincipalPage from "./pages-principal/Stady/ResultPrincipalPage.jsx";
import EventPrincipalPage from "./pages-principal/event/EventPrincipalPage.jsx";
import CreateEventPrincipalPage from "./pages-principal/event/CreateEventPrincipalPage.jsx";
import CreateSubjectPagePrincipal from "./pages-principal/subject/CreateSubjectPagePrincipal.jsx";
import SubjectPagePrincipal from "./pages-principal/subject/SubjectPagePrincipal.jsx";
import UpdateClassPrincipalPage from "./pages-principal/class/UpdateClassPrincipalPage";
import CreateClassPrincipalPage from "./pages-principal/class/CreateClassPrincipalPage";
import ClassPrincipalPage from "./pages-principal/class/ClassPrincipalPage";
import ClassDetailViewPrincipalPage from "./pages-principal/class/ClassDetailViewPrincipalPage";
import TeacherPrincipalPage from "./pages-principal/teacher/TeacherPrincipalPage";
import CreateTeacherPrincipalPage from "./pages-principal/teacher/CreateTeacherPrincipalPage";
import SchoolPrincipalPage from "./pages-principal/school/SchoolPrincipalPage";
import DashboardPagePrincipal from "./pages-principal/dashboard/DashboardPagePrincipal";

//Principal admin---------------
import PrincipalDetailViewPageAdmin from "./pages-admin/principals/PrincipalDetailViewPageAdmin";
import PrincipalsAdminPage from "./pages-admin/principals/PrincipalsAdminPage";
import CreatePrincipalAdminPage from "./pages-admin/principals/CreatePrincipalAdminPage";
import UpdatePrincipalAdminPage from "./pages-admin/principals/UpdatePrincipalAdminPage";
//Event---------------
import EventDetailViewPageAdmin from "./pages-admin/events/EventDetailViewPageAdmin";
import EventsAdminPage from "./pages-admin/events/EventsAdminPage";
import CreateEventPageAdmin from "./pages-admin/events/CreateEventPageAdmin";
import UpdateEventPageAdmin from "./pages-admin/events/UpdateEventPageAdmin";
//School---------------
import UpdateSchoolsPageAdmin from "./pages-admin/schools/UpdateSchoolsPageAdmin";
import SchoolDetailViewPageAdmin from "./pages-admin/schools/SchoolDetailViewPageAdmin";
import CreateSchoolsPageAdmin from "./pages-admin/schools/CreateSchoolsPageAdmin"; 
import SchoolsPageAdmin from "./pages-admin/schools/SchoolsPageAdmin";
//Layout----------------
import MainAuthLayout from "./component/layout/MainAuthLayout";
import MainLayoutPrincipal from "./component/layout/MainLayoutPrincipal";
// Ensure MainLayoutPrincipal is correctly imported and recognized by the build system.
import RouteNotFournd from "./component/404/RouteNotFournd";
import HomePage from "./pages/HomePage";
import TestPage from "./pages/TestPage";
import DashboardPageAdmin from "../src/pages-admin/dashboard/DashboardPageAdmin";
import MianLayoutAdmin from "./component/layout/MianLayoutAdmin.jsx";
import ProtectedRoute from "./component/layout/ProtectedRoute.jsx";
const App = () => {
  return (
    <>
      <Routes>
        {/**auth routes */}
        <Route element={<MainAuthLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/register" element={<TestPage />} />
        </Route>

        {/**admin routes   */}
        <Route element={<ProtectedRoute><MianLayoutAdmin /></ProtectedRoute>} path="/admin">
          <Route path="dashboard" element={<DashboardPageAdmin />} />
          {/* School Routes */}
          <Route path="schools" element={<SchoolsPageAdmin />} />
          <Route path="schools/create" element={<CreateSchoolsPageAdmin />} />
          <Route path="schools/view/:schoolId" element={<SchoolDetailViewPageAdmin />} />
          <Route path="schools/update/:schoolId" element={<UpdateSchoolsPageAdmin />} />
          {/* Event Routes */}
          <Route path="events" element={<EventsAdminPage />} />
          <Route path="events/create" element={<CreateEventPageAdmin />} /> 
          <Route path="events/update" element={<UpdateEventPageAdmin />} />
          <Route path="events/viewdetail" element={<EventDetailViewPageAdmin />} />
          {/* Principal Routes */}
          <Route path="principals" element={<PrincipalsAdminPage />} />
          <Route path="principals/:principalId" element={<PrincipalDetailViewPageAdmin />} />
          <Route path="principals/update/:principalId" element={<UpdatePrincipalAdminPage />} />
          <Route path="principals/create" element={<CreatePrincipalAdminPage />} />
        </Route>

        {/* Principal Routes */}
        <Route element={<ProtectedRoute><MainLayoutPrincipal /></ProtectedRoute>} path="/principal">
          <Route path="dashboard" element={<DashboardPagePrincipal />} />
          <Route path="schools" element={<SchoolPrincipalPage />} />
          <Route path="teachers" element={<TeacherPrincipalPage />} />
          <Route path="teachers/create" element={<CreateTeacherPrincipalPage />} />
          <Route path="subjects/create" element={<CreateSubjectPagePrincipal />} />
          <Route path="subjects" element={<SubjectPagePrincipal />} />
          <Route path="events" element={<EventPrincipalPage />} />
          <Route path="events/create" element={<CreateEventPrincipalPage />} />
          <Route path="events/viewdetail/:eventId" element={<EventViewdetailPrincipalPage />} />
          <Route path="results" element={<ResultPrincipalPage />} />
          <Route path="attendance" element={<AttendancePrincipalPage />} />
          <Route path="teachers/:teacherId" element={<TeacherDetailViewPrincipal />} />

          {/* Student Routes */}
          <Route path="students" element={<StudentPrincipalPages />} />
          <Route path="students/create" element={<CreateSudentPrincipalPages />} />
          <Route path="students/:studentId" element={<StudentDetailViewPrincipal />} />

          {/**class routes */}
          <Route path="classes" element={<ClassPrincipalPage />} />
          <Route path="classes/create" element={<CreateClassPrincipalPage />} />
          <Route path="classes/view/:classId" element={<ClassDetailViewPrincipalPage />} />
          <Route path="classes/update/:classId" element={<UpdateClassPrincipalPage />} /> {/* This line is already correct */}
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedRoute><MainLayoutTeacher /></ProtectedRoute>} path="/teacher">
          <Route path="dashboard" element={<DashboardPageTeacher />} />
          <Route path="classes" element={<ClassTeacherPage />} />
          <Route path="classes/:classId" element={<ClassDetailViewTeacherPage />} />
          <Route path="attendance" element={<AttendanceTeacherPage />} />
          <Route path="attendance-report" element={<AttendanceDataTeacherPage />} />
          <Route path="scores" element={<ScoreTeacherPage />} />
          <Route path="score-report" element={<ScoreReportTeacherPage />} />
          <Route path="results" element={<ResultTeacherPage />} />
          <Route path="students" element={<StudentTeacherPages />} />
          <Route path="students/:studentId" element={<StudentDetailViewTeacher />} />
          <Route path="students/create" element={<CreateSudentTeacherPages />} />
          <Route path="profile" element={<ProfileDetailViewTeacher />} />
          <Route path="change-password" element={<ProfileTeacherChangePassword />} />
          {/* Add more teacher-specific routes here */}
        </Route>

        <Route path="*" element={<RouteNotFournd />} />

      </Routes>

    </>
  );
};

export default App;
