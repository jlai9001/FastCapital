import './homepage_hero.css'
import logo from './investment_logo.png'




function HomePageHero(){
    // set states

    // display elements
    return (
        <div className = "homepage_hero">
            <div className = "hero_text"> FastCapital</div>
            <img className ="logo" src={logo} alt="My image"/>
        </div>
    )
}

export default HomePageHero
