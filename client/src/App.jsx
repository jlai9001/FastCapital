import { Routes, Route } from 'react-router-dom'
import Homepage from './pages/homepage.jsx'
import AllInvestments from './pages/all-investments.jsx'
import InvestmentDetails from './pages/investments-details.jsx'
import Purchase from './pages/purchase.jsx'
import Portfolio from './pages/portfolio.jsx'
import Login from './pages/login.jsx'
import NotFound from './pages/not-found.jsx'
import './App.css'


function App() {


  return (
    <>
<Routes>
        <Route path='/' element={<Homepage />}></Route>
        <Route path='/all-investments' element={<AllInvestments />}></Route>
        <Route path='/investment-details' element={<InvestmentDetails />}></Route>
        <Route path='/purchase' element={<Purchase />}></Route>
        <Route path='/portfolio' element={<Portfolio />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/not-found' element={<NotFound />}></Route>


      </Routes >
    </>
  )
}

export default App
