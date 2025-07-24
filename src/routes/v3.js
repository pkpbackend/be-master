import Express from 'express'

// add controller here
import HomeController from '../controllers/Home/controller'
import DashboardController from '../controllers/Dashboard/controller'
import DirektoratController from '../controllers/Direktorat/controller'
import PenerimaManfaatController from '../controllers/PenerimaManfaat/controller'
import WilayahController from '../controllers/Wilayah/controller'
import PerusahaanController from '../controllers/Perusahaan/controller'
import MasterKegiatanController from '../controllers/MasterKegiatan/controller'
import MasterKegiatanOporController from '../controllers/MasterKegiatanOpor/controller'
import PengembangController from '../controllers/Pengembang/controller'
import KomponenPengajuanController from '../controllers/KomponenPengajuan/controller'
import MasterDokumenController from '../controllers/MasterDokumen/controller'
import MasterKategoriDokumenController from '../controllers/MasterKategoriDokumen/controller'
import ProvinsiController from '../controllers/Provinsi/controller'
import CityController from '../controllers/City/controller'
import KecamatanController from '../controllers/Kecamatan/controller'
import DesaController from '../controllers/Desa/contoller'
import MasterTematikController from '../controllers/MasterTematik/controller'
import PemanfaatanController from '../controllers/Pemanfaatan/controller'
import FilterController from '../controllers/Filter/controller'
import HelpdeskController from '../controllers/Helpdesk/controller'
import ProOutputController from '../controllers/ProOutput/controller'
import ProKegiatanController from '../controllers/ProKegiatan/controller'
import ProProgramController from '../controllers/ProProgram/controller'
import ProSubOutputController from '../controllers/ProSubOutput/controller'
import MasterTematikPemanfaatanController from '../controllers/MasterTematikPemanfaatan/controller'
import MasterKelompokPengusulController from '../controllers/MasterKelompokPengusul/controller'
import MasterKondisiBangunanController from '../controllers/MasterKondisiBangunan/controller'
import SerahTerimaController from '../controllers/SerahTerima/controller'
import PembangunanController from '../controllers/Pembangunan/controller'

const route = Express.Router()

route.use('/v3', HomeController)
route.use('/v3/dashboard', DashboardController)
route.use('/v3/direktorat', DirektoratController)
route.use('/v3/penerimamanfaat', PenerimaManfaatController)
route.use('/v3/wilayah', WilayahController)
route.use('/v3/perusahaan', PerusahaanController)
route.use('/v3/masterkegiatan', MasterKegiatanController)
route.use('/v3/masterkegiatanopor', MasterKegiatanOporController)
route.use('/v3/pengembang', PengembangController)
route.use('/v3/komponenpengajuan', KomponenPengajuanController)
route.use('/v3/masterdokumen', MasterDokumenController)
route.use('/v3/masterkategoridokumen', MasterKategoriDokumenController)
route.use('/v3/provinsi', ProvinsiController)
route.use('/v3/city', CityController)
route.use('/v3/kecamatan', KecamatanController)
route.use('/v3/desa', DesaController)
route.use('/v3/mastertematik', MasterTematikController)
route.use('/v3/pemanfaatan', PemanfaatanController)
route.use('/v3/filter', FilterController)
route.use('/v3/helpdesk', HelpdeskController)
route.use('/v3/prooutput', ProOutputController)
route.use('/v3/prosuboutput', ProSubOutputController)
route.use('/v3/proprogram', ProProgramController)
route.use('/v3/prokegiatan', ProKegiatanController)
route.use('/v3/mastertematikpemanfaatan', MasterTematikPemanfaatanController)
route.use('/v3/masterkelompokpengusul', MasterKelompokPengusulController)
route.use('/v3/masterkondisibangunan', MasterKondisiBangunanController)
route.use('/v3/serahterima', SerahTerimaController)
route.use('/v3/pembangunan', PembangunanController)

export default route
