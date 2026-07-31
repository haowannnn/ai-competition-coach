# Generates sample "student solution" PNG images for the demo.
# Uses .NET System.Drawing (available on Windows PowerShell / pwsh with the assembly).
Add-Type -AssemblyName System.Drawing

function New-SolutionImage {
    param(
        [string]$Path,
        [string]$Title,
        [string[]]$Lines
    )
    $width = 900
    $height = 620
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.Clear([System.Drawing.Color]::FromArgb(255, 253, 252, 246))

    # faint ruled lines to mimic notebook paper
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 120, 140, 160), 1)
    for ($y = 120; $y -lt $height; $y += 44) {
        $g.DrawLine($pen, 40, $y, ($width - 40), $y)
    }

    $titleFont = New-Object System.Drawing.Font('Segoe UI', 20, [System.Drawing.FontStyle]::Bold)
    $bodyFont  = New-Object System.Drawing.Font('Consolas', 17)
    $inkBrush  = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 25, 40, 65))
    $blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 60, 140))

    $g.DrawString($Title, $titleFont, $blueBrush, 40, 36)

    $y = 116
    foreach ($line in $Lines) {
        $g.DrawString($line, $bodyFont, $inkBrush, 48, $y)
        $y += 44
    }

    $g.Dispose()
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Wrote $Path"
}

$dir = Join-Path $PSScriptRoot '..\public\samples'
New-Item -ItemType Directory -Force -Path $dir | Out-Null

# Sample 1 — CORRECT solution to q02 (complementary counting).
New-SolutionImage -Path (Join-Path $dir 'sample-correct.png') `
    -Title 'Q: at least one even digit in odd positions' `
    -Lines @(
        'Total arrangements of 1,2,3,4,5 = 5! = 120',
        '',
        'Complement: all odd positions are odd digits.',
        '  odd digits {1,3,5} into 3 odd slots = 3! = 6',
        '  even digits {2,4} into 2 even slots = 2! = 2',
        '  complement count = 6 x 2 = 12',
        '',
        'Answer = 120 - 12 = 108'
    )

# Sample 2 — WRONG solution to q06 (inclusion-exclusion, forgot to subtract overlap).
New-SolutionImage -Path (Join-Path $dir 'sample-wrong.png') `
    -Title 'Q: multiples of 3 or 5 in 1..200' `
    -Lines @(
        'multiples of 3: floor(200/3) = 66',
        'multiples of 5: floor(200/5) = 40',
        '',
        'so total = 66 + 40 = 106',
        '',
        'Answer = 106'
    )
