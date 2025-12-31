import React from "react";
import Footer from "../Components/Footer";
import Header from "../Components/Header";
import Slider from "react-slick"; // Import react-slick for the carousel
import { Container, Box, Typography } from "@mui/material";
import image2 from "../assets/images/image2.jpg";
import image3 from "../assets/images/image3.jpg";
import image4 from "../assets/images/image4.jpg";
import image5 from "../assets/images/image5.png";
import icon1 from "../assets/images/box-icon1.png";
import icon2 from "../assets/images/box-icon2.png";
import icon3 from "../assets/images/box-icon3.png";
import icon4 from "../assets/images/box-icon4.png";
import icon5 from "../assets/images/box-icon5.png";


// Carousel images (assumed to be PNG files)
import carouselImg1 from "../assets/images/carouselImg1.png";
import carouselImg2 from "../assets/images/carouselImg2.png";
import carouselImg3 from "../assets/images/carouselImg3.png";
import carouselImg4 from "../assets/images/carouselImg4.png";

const About = () => {
  // Carousel images for autoplay slider
  const carouselImages = [
    carouselImg1,
    carouselImg2,
    carouselImg3,
    carouselImg4,
  ];
  // Carousel settings
  const carouselSettings = {
    infinite: true,
    speed: 2000,         // Slide speed in ms
    slidesToShow: 4,     // Show three images at a time
    slidesToScroll: 1,
    autoplay: true,      // Enable auto-slide
    autoplaySpeed: 3000, // Interval between slides in ms
    arrows: true,        // Show navigation arrows
    dots: false,         // Hide dots
    fade: false,         // Disable fade effect for horizontal slide
    rtl: false,
  };

  return (
    <div>
      {/* Header */}
      <Header />
      {/* Main Header */}
      <Container
        maxWidth={false}
        sx={{
          height: { xs: "30vh", md: "84vh" },
          backgroundImage: `url(${image3})`,
          backgroundSize: "1900px 800px",
          backgroundRepeat: "no-repeat",
          textAlign: "center",
          alignContent: "center",
        }}
      >
        <Typography variant="h1" color="#ffff">
          UniVoy
        </Typography>
      </Container>

      {/* Information Section */}
      <Container
        maxWidth="lg"
        sx={{
          border: "2px dotted #4caf50",
          borderRadius: "30px",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          mt: 10,
          mb: 15,
        }}
      >
        {/* Background Image Section */}
        <Box
          sx={{
            height: { xs: "30vh", md: "50vh" },
            backgroundImage: `url(${image4})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderRadius: "28px 0px 0 28px",
            width: { xs: "100%", md: "50%" },
            marginRight: { md: "50px" },
            marginLeft: "-24px",
          }}
        ></Box>

        {/* Text Content Section */}
        <Box sx={{ pt: 7, width: { xs: "100%", md: "50%" } }}>
          <Typography variant="h4" color="#4caf50" gutterBottom>
            What is UniVoy?
          </Typography>
          <Typography gutterBottom>
            UniVoy is a comprehensive study abroad consultancy platform designed
            to simplify the application process for students aspiring to pursue
            higher education internationally. Whether you're looking for
            universities in the UK, Australia, or the USA, UniVoy connects you
            with the right programs, consultants, and resources to help you
            achieve your educational goals.
          </Typography>
          <Typography>
            <ul style={{ listStyleType: "circle", paddingLeft: "20px" }}>
              <li>Explore universities by country, course, or scholarships.</li>
              <li>Submit applications with required documents effortlessly.</li>
              <li>Make payments securely and transparently.</li>
              <li>Track application progress in real-time.</li>
              <li>Receive expert guidance from experienced consultants.</li>
            </ul>
          </Typography>
        </Box>
      </Container>

      {/* About UniVoy Section */}
      <Container
        maxWidth={false}
        sx={{
          backgroundColor: "#4CAF50",
          height: "70vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ pt: 15, width: { xs: "100%", md: "35%", paddingRight: "60px" } }}>
          <Typography variant="h4" color="#ffff" gutterBottom>
            About UniVoy
          </Typography>
          <Typography gutterBottom>
            "UniVoy is a trusted study abroad consultancy platform dedicated to
            guiding students on their journey to achieving higher education in
            international universities. With a mission to simplify the
            application process, UniVoy bridges the gap between students and
            universities, offering expert guidance, tailored services, and a
            seamless platform to explore opportunities worldwide.
            <br />
            <br />
            Our vision is to empower students to make informed decisions about their education, connecting them with the best universities globally and helping them achieve their dreams. From searching for universities to application submission, tracking progress, and making secure payments, UniVoy is your all-in-one solution."
          </Typography>
        </Box>
        <Box
          sx={{
            height: { xs: "30vh", md: "70vh" },
            backgroundImage: `url(${image5})`,
            backgroundSize: "contain",
            backgroundPosition: "right",
            backgroundRepeat: "no-repeat",
            width: { xs: "100%", md: "35%" },
          }}
        ></Box>
      </Container>

      {/* Our Mission Section with Image Slider */}
      <Container
        sx={{
          backgroundColor: "#ffff",
          height: "60vh",
          justifyContent: "center",
          textAlign: "center",
          pt: 10,
          pb: 10,
        }}
      >
        <Box sx={{ width: { xs: "100%", md: "100%" }, pb: "2em" }}>
          <Typography variant="h4" color="#20522B" gutterBottom>
            Our Mission
          </Typography>
          <Typography gutterBottom color="#20522B">
            To simplify and enhance the study abroad process by providing a
            comprehensive, <br />
            user-friendly platform that connects students with top universities
            and expert consultants.
          </Typography>
        </Box>

        {/* Image Slider */}
        <Slider {...carouselSettings}>
          {carouselImages.map((image, index) => (
            <Box key={index} sx={{ padding: "0 10px" }}>
              <Box
                component="img"
                src={image}
                alt={`Carousel Image ${index + 1}`}
                sx={{ width: "100%", height: "auto", borderRadius: "12px" }}
              />
            </Box>
          ))}
        </Slider>
      </Container>
      <Container
        maxWidth={false}
        sx={{
          height: { xs: "30vh", md: "90vh" },
          backgroundImage: `url(${image2})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          textAlign: "center",
          alignContent: "center",
        }}
      >
        <Typography variant="h3" color="#ffff" pb={8}>
          Why Choose UniVoy?
        </Typography>
        <Box sx={{
          gap: 4,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Box sx={{
            width: '300px',
            height: '200px',
            borderRadius: '12px',
            background: '#22502C',
            backgroundImage: `url(${icon1})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "25% 30%",
            backgroundPosition: "110px 15px"


          }}>
            <Box mt={10}>
              <Typography variant="h5" color="white">
                Personalized Guidance
              </Typography>
              <Typography color="white">Our consultants tailor advice based on your profile and goals</Typography>
            </Box>
          </Box>
          <Box sx={{
            width: '300px',
            height: '200px',
            borderRadius: '12px',
            background: '#22502C',
            backgroundImage: `url(${icon2})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "25% 30%",
            backgroundPosition: "110px 15px"
          }}>
            <Box mt={10}>
              <Typography variant="h5" color="white">
              Trusted Network

              </Typography>
              <Typography color="white">Partnerships with top universities worldwide.
</Typography>
            </Box>
          </Box>
          <Box sx={{
            width: '300px',
            height: '200px',
            borderRadius: '12px',
            background: '#22502C',
            backgroundImage: `url(${icon3})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "25% 30%",
            backgroundPosition: "110px 15px"
          }}>
            <Box mt={10}>
              <Typography variant="h5" color="white">
              Comprehensive Services
              </Typography>
              <Typography color="white">We handle everything from application submission to payment processing.
</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{
          mt: 3,
          gap: 4,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Box sx={{
            width: '300px',
            height: '200px',
            borderRadius: '12px',
            background: '#22502C',
            backgroundImage: `url(${icon4})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "25% 30%",
            backgroundPosition: "110px 15px"
          }}>
            <Box mt={10}>
              <Typography variant="h5" color="white">
              Transparent Process

              </Typography>
              <Typography color="white">Transparent Process: Real-time updates and secure transactions.
</Typography>
            </Box>
          </Box>
          <Box sx={{
            width: '300px',
            height: '200px',
            borderRadius: '12px',
            background: '#22502C',
            backgroundImage: `url(${icon5})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "25% 30%",
            backgroundPosition: "110px 15px"
          }}>
            <Box mt={10}>
              <Typography variant="h5" color="white">
              Global Opportunities
              </Typography>
              <Typography color="white">Access to universities in the UK, USA, Australia, and beyond.</Typography>
            </Box>
          </Box>
        </Box>
      </Container>
      <Footer />
    </div>
  );
};

export default About;