<?php
namespace MicroweberPackages\Export\Formats;

use MicroweberPackages\Export\Formats\Interfaces\ExportInterface;
use function backup_location;
use function route;

class DefaultExport implements ExportInterface
{
	public $type = 'json';
	public $data;

	public function __construct($data = array())
	{
		$this->data = $data;
	}

	public function setType($type)
	{
		$this->type = $type;
	}

	public function start()
	{
		// start exporting
	}

	protected function _generateFilename($name = false)
	{
		if ($name) {
			$exportFilename = $name . '.' . $this->type;
		} else {
			$exportFilename = 'backup_' . date("Y-m-d-his") . '.' . $this->type;
		}

		return array(
			'download' => route('admin.backup.download').'?file=' . $exportFilename,
			'filepath' => backup_location() . $exportFilename,
			'filename' => $exportFilename
		);
	}
}
