$root = "src\app\(sistema)\administrador"
$files = Get-ChildItem -Path $root -Recurse -Filter "*.tsx"

$replacements = @(
    # Botones bg-blue-600 → bg-[#8B1E1E]
    @{ Old = 'bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold'
       New = 'bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm font-semibold' },
    @{ Old = 'bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
       New = 'bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors' },
    @{ Old = 'bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
       New = 'bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] disabled:opacity-50 disabled:cursor-not-allowed' },
    @{ Old = 'bg-blue-600 text-white'; New = 'bg-[#8B1E1E] text-white' },
    @{ Old = 'bg-blue-600 h-2 rounded-full'; New = 'bg-[#8B1E1E] h-2 rounded-full' },
    # Botones bg-green-600 → bg-[#166534] (acción positiva)
    @{ Old = 'bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold'
       New = 'bg-[#166534] text-white rounded-lg hover:bg-[#14532d] transition-colors text-sm font-semibold' },
    @{ Old = 'bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
       New = 'bg-[#166534] text-white rounded-lg hover:bg-[#14532d] transition-colors' },
    @{ Old = 'bg-green-600 text-white'; New = 'bg-[#166534] text-white' }
)

$totalFiles = 0

foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    } catch { continue }
    $changed = $false

    foreach ($rep in $replacements) {
        if ($content.Contains($rep.Old)) {
            $content = $content.Replace($rep.Old, $rep.New)
            $changed = $true
        }
    }

    if ($changed) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $($file.Name)"
        $totalFiles++
    }
}

Write-Host ""
Write-Host "Done. $totalFiles file(s) updated."
