import { Routes, Route } from 'react-router-dom'
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


function App() {


  return (
    <>

      <Nav />
      <div style={{ height: '60px' }} />
      <Routes>
        <Route path='/' element={<Homepage />}></Route>
        <Route path='/signup' element={<SignupForm />}></Route>
        <Route path='/all-investments' element={<AllInvestments />}></Route>
        <Route path='/investment-details/:investmentId' element={<InvestmentDetails />}></Route>
        <Route path='/investment-details/:investmentId/purchase' element={<Purchase />}></Route>
        <Route path='/portfolio' element={<Portfolio />}></Route>
        <Route path='/business-profile' element={<BusinessProfile />}></Route>
        <Route path='/add-business' element={<AddBusiness />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/testpage' element={<TestPage />}></Route>
        <Route path='/not-found' element={<NotFound />}></Route>
        <Route path='/create-investment' element={<NewInvestment />}></Route>
        <Route path='/create-financials' element={<AddFinancials />}></Route>
      </Routes >
      <Footer />
    </>
  )
}

export default App



// reference
// Router Setup

// import {BrowserRouter,Routes,Route} from "react-router-dom";
// import Home from "./pages/home";
// import FullCollection from "./pages/collection";
// import GameDetails from "./pages/game_detail";
// import AddGame from "./pages/add_game";

// function App() {
//   return (

//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/home" element={<Home/>} />
//         <Route path="/collection" element={<FullCollection />} />
//         <Route path="/add_game" element ={<AddGame />} />
//         {/* Route with the ID parameter */}
//         <Route path="/game_details/:id" element={<GameDetails />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
