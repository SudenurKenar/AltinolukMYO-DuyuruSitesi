import { Routes, Route } from "react-router-dom";
import Anasayfa from "./Sayfalar/Anasayfa";
import AnaLayout from "./Layouts/AnaLayout";
import GirisYap from "./Sayfalar/GirisYap";
import Admin from "./Sayfalar/Admin";
import AdminLayout from "./Layouts/AdminLayout";
import SayfaBulunamadi from "./Sayfalar/SayfaBulunamadi";
import Arsiv from "./Sayfalar/Arsiv";
import KategoriYonetimi from "./Sayfalar/KategoriYonetimi";
import DuyuruDetay from "./Sayfalar/DuyuruDetay";

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

      {/* ========================================== */}
      {/* 2. YÖNETİM PANELİ (Sadece Yöneticilere Özel)  */}
      {/* ========================================== */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Admin />} />
        <Route path="arsiv" element={<Arsiv />} />
        <Route path="kategori" element={<KategoriYonetimi />} />
      </Route>
    </Routes>
  );
}

export default App;