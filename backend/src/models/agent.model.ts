import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
    userId: { 
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true 
        },
    name: {
        type: String,
        required: true
    },
    knowledgeBase:{
        type: String,
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    tools: [
        {
            type: String,
            required: true
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const AgentModel = mongoose.model("Agent", agentSchema);
export default AgentModel;