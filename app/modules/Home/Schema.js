const mongoose = require('mongoose');

const homepageSchema = new mongoose.Schema({

    main: [{
        title: { type: String, unique: true },
        description: { type: String }
    }],
    about: [{
        title: { type: String, unique: true },
        content: { type: String }
    }],
    didit: [{
        title: { type: String, unique: true },
        challenge: { type: String },
        challengeData: { type: String },
        solution: { type: String },
        solutionData: { type: String },
        imageUrl: { type: String }

    }],
    results: [{
        title: { type: String },
        content: { type: String }
    }],
    clients: [{
        profileImage: { type: String },
        name: { type: String },
        description: { type: String },
        feedback: { type: String }
    }],
    relatedProjects: [{
        title: { type: String },
        content: { type: String },
        imageUrl: { type: String }
    }]
}, {
    timestamps: true
});

const Homepage = mongoose.model('homepage', homepageSchema);

module.exports = { Homepage }