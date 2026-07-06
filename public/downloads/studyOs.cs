using System;
using System.Diagnostics;
using System.Windows.Forms;

namespace StudyOsApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try 
            {
                // This command launches Microsoft Edge in "App Mode" (no tabs, no URL bar), making it look like a native desktop app.
                Process.Start("msedge.exe", "--app=https://studyos-tnzt.onrender.com/dashboard");
            } 
            catch (Exception)
            {
                // Fallback to default browser if Edge is not available
                try 
                {
                    Process.Start("https://studyos-tnzt.onrender.com/dashboard");
                } 
                catch (Exception ex)
                {
                    MessageBox.Show("Could not launch the application: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }
    }
}
