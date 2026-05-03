import { Routes, Route } from "react-router-dom";
import Anasayfa from "./Sayfalar/Anasayfa";
import AnaLayout from "./Layouts/AnaLayout";
import GirisYap from "./Sayfalar/GirisYap";
import Admin from "./Sayfalar/Admin";
import AdminLayout from "./Layouts/AdminLayout";
import SayfaBulunamadi from "./Sayfalar/SayfaBulunamadi";
import Arsiv from "./Sayfalar/Arsiv";
import DuyuruDetay from "./Sayfalar/DuyuruDetay";
import OdevGonder from "./Sayfalar/OdevGonder";
import AdminOdevler from "./Sayfalar/AdminOdevler";
import AdminDersler from "./Sayfalar/AdminDersler";
import LinkYonetimi from "./Sayfalar/LinkYonetimi";
import AdminProfil from "./Sayfalar/AdminProfil";

function App() {
  return (
    <Routes>

      {/* ========================================== */}
      {/* 1. GENEL SİTE ROTALARI (Herkese Açık Vitrin) */}
      {/* ========================================== */}
      <Route path="/" element={<AnaLayout><Anasayfa /></AnaLayout>} />
      <Route path="/giris" element={<AnaLayout><GirisYap /></AnaLayout>} />
      <Route path="*" element={<AnaLayout><SayfaBulunamadi /></AnaLayout>} />
      <Route path="/detay/:id/:slug" element={<DuyuruDetay />} />
      <Route path="/OdevGonder" element={<AnaLayout><OdevGonder /></AnaLayout>} />

      {/* ========================================== */}
      {/* 2. YÖNETİM PANELİ (Sadece Yöneticilere Özel)  */}
      {/* ========================================== */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Admin />} />
        <Route path="arsiv" element={<Arsiv />} />
        <Route path="odevler" element={<AdminOdevler />} />
        <Route path="dersler" element={<AdminDersler />} />
        <Route path="linkler" element={<LinkYonetimi />} />
        <Route path="*" element={<SayfaBulunamadi />} />
        <Route path="profil" element={<AdminProfil />} />
      </Route>
    </Routes>
  );
}

export default App;