router.get("/employees/:team", async (req, res) => {
  try {
    const users = await User.find({
      role: "employee",
      team: req.params.team,
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employees" });
  }
});