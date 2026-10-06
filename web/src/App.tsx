import './App.css'
import motoCareLogo from '../../mobile/assets/motocarelogo.png'

function App() {
  return (
    <main className="ad">
      <nav className="ad__nav" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="MotoCare home">
          <img className="brand__logo" src={motoCareLogo} alt="MotoCare" />
        </a>
        <span className="nav-note">Your ride, remembered.</span>
      </nav>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
          <p className="eyebrow">Made for every mile</p>
          <h1 id="hero-title">
            Take better care
            <br />
            of your <em>ride.</em>
          </h1>
          <p className="hero__copy">
            The all-in-one companion for riders who want to spend less time
            remembering and more time riding.
          </p>
          <a className="button" href="#download">
            Discover MotoCare
            <span aria-hidden="true">↗</span>
          </a>
          <p className="fine-print">Your bike&apos;s story, all in one app.</p>
        </div>

        <div className="bike-card" aria-label="MotoCare motorcycle dashboard preview">
          <div className="bike-card__glow" />
          <div className="bike-card__top">
            <span className="mini-brand">MOTOCARE</span>
            <span className="status-dot">● All good</span>
          </div>
          <div className="bike-illustration" aria-hidden="true">
            <span className="wheel wheel--back" />
            <span className="wheel wheel--front" />
            <span className="frame frame--main" />
            <span className="frame frame--front" />
            <span className="seat" />
            <span className="handlebar" />
            <span className="headlight" />
          </div>
          <div className="bike-card__bottom">
            <div>
              <span className="label">Your garage</span>
              <strong>Ready for the road</strong>
            </div>
            <span className="arrow" aria-hidden="true">→</span>
          </div>
        </div>
      </section>

      <section className="features" aria-label="MotoCare app features">
        <article className="feature">
          <span className="feature__number">01</span>
          <div>
            <h2>Know your bike</h2>
            <p>Keep every ride, detail, and document organized.</p>
          </div>
        </article>
        <article className="feature">
          <span className="feature__number">02</span>
          <div>
            <h2>Never miss a service</h2>
            <p>Get simple reminders before small jobs become big ones.</p>
          </div>
        </article>
        <article className="feature">
          <span className="feature__number">03</span>
          <div>
            <h2>Ride with confidence</h2>
            <p>Fuel, maintenance, and history are ready when you are.</p>
          </div>
        </article>
      </section>

      <footer className="ad__footer" id="download">
        <span>Built for the way you ride.</span>
        <span className="footer-line" />
        <span>Coming soon on iOS &amp; Android</span>
      </footer>
    </main>
  )
}

export default App
