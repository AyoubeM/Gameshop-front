router.get("/latest", async (req, res) => {
  try {
    const latestProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(latestProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
