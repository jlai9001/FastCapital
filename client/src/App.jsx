import {Routes, Route } from 'react-router-dom'
import Homepage from './pages/homepage.jsx'
import AllInvestments from './pages/all-investments.jsx'
import InvestmentDetails from './pages/investments-details.jsx'
import Purchase from './pages/purchase.jsx'
import Portfolio from './pages/portfolio.jsx'
import Login from './pages/login.jsx'
import NotFound from './pages/not-found.jsx'
import './App.css'
import Nav from './components/Nav.jsx'
import TestPage from './pages/testpage.jsx'
import SignupForm from './pages/signup.jsx'
import NewInvestment from './pages/create-investment.jsx'
import AddFinancials from './pages/create-financials.jsx'
import AddBusiness from './pages/add-business.jsx'
import BusinessProfile from './pages/business-profile.jsx'
import Footer from './components/footer.jsx'
import Terms from './pages/terms.jsx'
import About from './pages/about.jsx'
import Contact from './pages/contact.jsx'
import ScrollToTop from "./components/ScrollToTop";
import AuthRouteGuard from "./components/AuthRouteGuard";
import ProtectedRouteGate from "./components/ProtectedRouteGate";
import UIBlockerOverlay from "./components/UIBlockerOverlay.jsx";


function App() {


  return (
<>
  <UIBlockerOverlay />
  <ScrollToTop />
  <AuthRouteGuard />
  <ProtectedRouteGate>
  <div className="app-shell">
    <Nav />
    <div style={{ height: '60px' }} />
    <main className="app-main">
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/signup' element={<SignupForm />} />
        <Route path='/all-investments' element={<AllInvestments />} />
        <Route path='/investment-details/:investmentId' element={<InvestmentDetails />} />
        <Route path='/investment-details/:investmentId/purchase' element={<Purchase />} />
        <Route path='/portfolio' element={<Portfolio />} />
        <Route path='/business-profile' element={<BusinessProfile />} />
        <Route path='/add-business' element={<AddBusiness />} />
        <Route path='/login' element={<Login />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/testpage' element={<TestPage />} />
        <Route path='/not-found' element={<NotFound />} />
        <Route path='/create-investment' element={<NewInvestment />} />
        <Route path="/create-financials/:businessId" element={<AddFinancials />} />
      </Routes>
    </main>
    <Footer />
  </div>
  </ProtectedRouteGate>
</>
)
}

export default App
