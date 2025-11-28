# Project-1
Learning


using System;
using System.IO;
using System.Drawing;
using System.Windows.Forms;

class ImageForm : Form
{
    private PictureBox pictureBox;

    public ImageForm(string imagePath)
    {
        if (string.IsNullOrEmpty(imagePath))
            throw new ArgumentException("imagePath must be provided");

        Text = Path.GetFileName(imagePath);
        StartPosition = FormStartPosition.CenterScreen;
        KeyPreview = true;
        KeyDown += (s, e) => { if (e.KeyCode == Keys.Escape) Close(); };

        pictureBox = new PictureBox
        {
            Dock = DockStyle.Fill,
            SizeMode = PictureBoxSizeMode.Zoom,
            BackColor = Color.Black
        };

        Controls.Add(pictureBox);

        LoadImageIntoPictureBox(imagePath);
    }

    private void LoadImageIntoPictureBox(string path)
    {
        if (!File.Exists(path))
        {
            MessageBox.Show($"File not found: {path}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
            return;
        }

        using (var fs = new FileStream(path, FileMode.Open, FileAccess.Read))
        using (var ms = new MemoryStream())
        {
            fs.CopyTo(ms);
            ms.Position = 0;
            Image img = Image.FromStream(ms);

            var screen = Screen.FromControl(this).WorkingArea;
            int maxW = (int)(screen.Width * 0.9);
            int maxH = (int)(screen.Height * 0.9);

            int targetW = Math.Min(img.Width + 20, maxW);
            int targetH = Math.Min(img.Height + 80, maxH);

            ClientSize = new Size(targetW, targetH);

            pictureBox.Image = new Bitmap(img);
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            pictureBox?.Image?.Dispose();
            pictureBox?.Dispose();
        }
        base.Dispose(disposing);
    }
}

static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        string imagePath = args.Length > 0 ? args[0] : null;

        if (string.IsNullOrEmpty(imagePath))
        {
            using (var ofd = new OpenFileDialog())
            {
                ofd.Filter = "IMG_20251122_151136857_AE.jpg";
                ofd.Title = "Select an image to open";
                if (ofd.ShowDialog() != DialogResult.OK)
                    return;
                imagePath = ofd.FileName;
            }
        }

        Application.Run(new ImageForm(imagePath));
    }
}
