import React from 'react';
import { useState, useEffect } from "react";

import CSS from "./styles/global.css.js";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import QBankPage from "./pages/QBankPage.jsx";
import VocabPage from "./pages/VocabPage.jsx";
import ExamPage from "./pages/ExamPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import AIPage from "./pages/AIPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

const PAGES = {
  dashboard: DashboardPage,
  qbank: QBankPage,
  vocab: VocabPage,
  exam: ExamPage,
  users: UsersPage,
  ai: AIPage,
  profile: ProfilePage,
};

export default function AdminApp() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const PageComponent = PAGES[page];

  return (
    <>
      <style>{CSS}</style>
      <div className="admin-root">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          page={page}
          setPage={setPage}
        />

        {/* Main */}
        <div className={`main-wrapper${collapsed ? " collapsed" : ""}`}>
          <Header page={page} setPage={setPage} dark={dark} setDark={setDark} />

          <main className="content-area" key={page}>
            <PageComponent />
          </main>
        </div>
      </div>
    </>
  );
}
