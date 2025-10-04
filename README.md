# 🚀 Space Habitat Layout Creator

[![NASA Space Challenge 2025](https://img.shields.io/badge/NASA-Space%20Challenge%202025-blue.svg)](https://github.com/Rou45/NASA_SPACE_CHALLENGE_HACKATHON)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-Latest-000000.svg)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **An innovative 3D space habitat design platform built for NASA Space Challenge Hackathon 2025**

![Space Habitat Layout Creator](https://img.shields.io/badge/Status-Live%20Demo-brightgreen.svg)

## 🌟 Project Overview

The **Space Habitat Layout Creator** is an advanced, interactive 3D design platform that enables engineers, scientists, and space enthusiasts to create, visualize, and validate space habitats for various missions including Lunar bases, Mars colonies, and deep space exploration.

### 🎯 Project Objectives

- **Design Innovation**: Create intuitive tools for space habitat design and planning
- **NASA Standards Compliance**: Implement real NASA engineering standards and requirements
- **Real-time Validation**: Provide instant feedback on design viability and safety
- **Mission Planning**: Support various space missions with adaptive habitat configurations
- **Accessibility**: Make space habitat design accessible to engineers and educators worldwide

## 🚨 Problem Statement

### The Challenge: Future of Human Space Exploration

As humanity prepares for long-duration missions to the Moon, Mars, and beyond, one of the most critical challenges is designing sustainable, safe, and efficient living spaces for astronauts. Current challenges include:

- **Limited Design Tools**: Lack of accessible 3D visualization tools for space habitat planning
- **Complex Requirements**: NASA standards are complex and difficult to implement in design workflows
- **Mission Variability**: Different missions (LEO, Lunar, Mars) require unique habitat specifications
- **Real-time Validation**: Need for instant feedback on design compliance and safety
- **Resource Optimization**: Maximizing space utilization while meeting crew requirements

## 🏆 NASA Space Challenge Connection

This project addresses key themes from NASA Space Challenge 2025:

### 🌙 **Lunar Infrastructure**
- Design habitats for lunar surface missions
- Account for lunar gravity (1/6 Earth gravity)
- Radiation protection and thermal management

### 🔴 **Mars Exploration**
- Extended mission duration habitat design
- Mars-specific environmental challenges
- Resource utilization and sustainability

### 🛰️ **Deep Space Missions**
- Long-duration space travel habitats
- Minimal resupply capability planning
- Psychological well-being considerations

### 📡 **NASA API Integration**
- **Real-time ISS Tracking**: Live International Space Station position data
- **Astronomy Picture of the Day**: Educational space imagery integration
- **Near Earth Object Monitoring**: Space situational awareness data

## ✨ Key Features

### 🎮 **Interactive 3D Design**
- **Real-time 3D Visualization**: Powered by Three.js for immersive habitat design
- **Drag & Drop Interface**: Intuitive module placement and positioning
- **Multiple View Modes**: Wireframe, solid, and technical drawing views
- **Animation Controls**: Dynamic camera movement and module animations

### 🛡️ **NASA Standards Validation**
- **Real-time Compliance Checking**: Instant validation against NASA habitat requirements
- **Safety Analysis**: Automated safety and accessibility assessments
- **Mission-specific Validation**: Different standards for LEO, Lunar, and Mars missions
- **Detailed Reporting**: Comprehensive validation reports with recommendations

### 📊 **Advanced Export Capabilities**
- **JSON Format**: Complete habitat data for engineering analysis
- **CSV Export**: Tabular data for spreadsheet analysis
- **HTML Reports**: Professional presentation-ready documentation
- **3D Model Export**: STL/OBJ format support for 3D printing and CAD

### 🌓 **Smart UI/UX**
- **Day/Night Themes**: Adaptive interface for different working conditions
- **Glass Effect Design**: Modern glassmorphism UI with professional aesthetics
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant design for inclusive usage

### 🚀 **NASA API Integration**
- **Live Space Data**: Real-time ISS position and orbital information
- **Educational Content**: Daily astronomy pictures and space facts
- **Mission Context**: Current space missions and objectives data

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18.x**: Modern component-based architecture
- **TypeScript 5.x**: Type-safe development with enhanced IDE support
- **Vite**: Lightning-fast build tool and development server

### **3D Graphics & Visualization**
- **Three.js**: Advanced 3D graphics and WebGL rendering
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers and abstractions for 3D development

### **State Management & Data**
- **Zustand**: Lightweight state management for complex application state
- **NASA APIs**: Real-time space data integration
- **Local Storage**: Persistent design data and user preferences

### **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **CSS3 Animations**: Smooth transitions and micro-interactions
- **Glassmorphism Effects**: Modern glass-effect styling

### **Development Tools**
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **TypeScript Compiler**: Static type checking and compilation

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Modern Web Browser** with WebGL support

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Rou45/NASA_SPACE_CHALLENGE_HACKATHON.git
   cd NASA_SPACE_CHALLENGE_HACKATHON
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your NASA API key (optional - demo works without it)
   VITE_NASA_API_KEY=your_nasa_api_key_here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📖 Usage Guide

### 🏗️ **Creating Your First Habitat**

1. **Launch the Application**: Open the web application in your browser
2. **Start Design**: Click "Create Your First Habitat" to open the design wizard
3. **Choose Mission Type**: Select from LEO, Lunar Surface, Mars, or Deep Space
4. **Add Modules**: Drag and drop habitat modules from the sidebar
5. **Configure Settings**: Adjust crew size, mission duration, and specific requirements
6. **Validate Design**: Use the validation panel to check NASA compliance
7. **Export Results**: Download your habitat design in multiple formats

### 🎮 **3D Viewer Controls**

- **Rotate**: Click and drag to rotate the 3D view
- **Zoom**: Mouse wheel or pinch to zoom in/out
- **Pan**: Right-click and drag to pan the camera
- **Module Selection**: Click on modules to select and configure them
- **Animation**: Use the sidebar controls to adjust animation speed

### 📊 **Validation & Analysis**

- **Real-time Feedback**: Instant validation as you design
- **Compliance Score**: Overall NASA standards compliance percentage
- **Issue Identification**: Specific problems and recommendations
- **Mission Suitability**: Analysis for different mission types

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── 3d/             # Three.js 3D components
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   ├── modals/         # Modal dialogs and overlays
│   └── panels/         # Side panels and control interfaces
├── contexts/           # React Context providers
├── pages/             # Main application pages
├── services/          # API services and external integrations
├── stores/            # Zustand state management
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
└── styles/            # CSS and styling files
```

## 🌐 Live Demo

🔗 **[Live Demo](https://your-deployment-url.vercel.app)** - Experience the Space Habitat Layout Creator

*Note: Replace with your actual deployment URL after deploying to Vercel/Netlify*

## 🤝 Contributing

We welcome contributions from the space technology community! Here's how you can help:

### **How to Contribute**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Areas for Contribution**
- Additional NASA standards implementation
- New habitat module types
- Enhanced 3D visualization features
- Performance optimizations
- Documentation improvements
- Accessibility enhancements

## 📋 Roadmap

### **Phase 1 - Foundation** ✅
- [x] Basic 3D habitat visualization
- [x] NASA API integration
- [x] Core validation engine
- [x] Export functionality

### **Phase 2 - Enhancement** 🚧
- [ ] Advanced physics simulation
- [ ] VR/AR support
- [ ] Collaborative design features
- [ ] AI-powered design suggestions

### **Phase 3 - Integration** 📋
- [ ] CAD software integration
- [ ] NASA mission planning tools
- [ ] Educational institution partnerships
- [ ] Mobile application development

## 🏆 Awards & Recognition

- **🥇 NASA Space Challenge Hackathon 2025** - *Participant*
- **🚀 Innovation in Space Technology** - *Recognition for 3D Visualization*
- **🌟 Open Source Contribution** - *Community Impact*

## 👨‍💻 Author

**Roushan Kumar**

🔗 **Connect with me:**
- **LinkedIn**: [Roushan Kumar](https://www.linkedin.com/in/roushan-kumar-40b050207/)
- **GitHub**: [@Rou45](https://github.com/Rou45)
- **Email**: roushan.tech@example.com

### About the Developer
Passionate software engineer with expertise in 3D visualization, space technology, and modern web development. Dedicated to advancing human space exploration through innovative technology solutions.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Roushan Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **NASA** - For providing open APIs and inspiring space exploration
- **Three.js Community** - For excellent 3D graphics framework
- **React Community** - For robust frontend development tools
- **Open Source Contributors** - For various libraries and tools used
- **Space Exploration Enthusiasts** - For feedback and inspiration

## 🆘 Support

Having issues? We're here to help!

- **📖 Documentation**: Check our comprehensive guides
- **🐛 Bug Reports**: [Open an issue](https://github.com/Rou45/NASA_SPACE_CHALLENGE_HACKATHON/issues)
- **💡 Feature Requests**: [Submit your ideas](https://github.com/Rou45/NASA_SPACE_CHALLENGE_HACKATHON/issues)
- **💬 Discussions**: [Join the conversation](https://github.com/Rou45/NASA_SPACE_CHALLENGE_HACKATHON/discussions)

---

<div align="center">

**🚀 Made with ❤️ for NASA Space Challenge Hackathon 2025 🚀**

*Advancing human space exploration through innovative technology*

[![Star this repo](https://img.shields.io/github/stars/Rou45/NASA_SPACE_CHALLENGE_HACKATHON?style=social)](https://github.com/Rou45/NASA_SPACE_CHALLENGE_HACKATHON)
[![Follow @Rou45](https://img.shields.io/github/followers/Rou45?style=social)](https://github.com/Rou45)

</div>