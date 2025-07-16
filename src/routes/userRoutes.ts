import express from "express";
import axios from "axios";

const router = express.Router();

router.patch("/:userId/metadata", async (req, res) => {
    const { userId } = req.params;
    const { publicMetadata } = req.body;

    try {
        const response = await axios.patch(
            `https://api.clerk.com/v1/users/${userId}/metadata`,
            { public_metadata: publicMetadata },
            {
                headers: {
                    Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({ success: true, data: response.data });
    } catch (error: any) {
        console.error("Error updating user metadata:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;