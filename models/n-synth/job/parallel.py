def save_embeddings(core):
	input_path = 'data/input'
	output_path = 'data/embeddings_raw'
	print("SAVE")
	print(core)
	subprocess.call(["nsynth_save_embeddings", 
		"--checkpoint_path=%s/model.ckpt-200000" %(checkpoint_dir), 
		"--source_path=%s/batch%i" %(input_path, core), 
		"--save_path=%s/batch%i" %(output_path, core), 
		"--log=ERROR",
		"--batch_size=%s" %(BATCH_SIZE_SAVE_EMBEDDINGS)])

# PARALLIZE TASKS
num_cores = 4
batch_size = num_input_files / num_cores
#	split the embeddings per gpu in folders
for i in range(0, num_cores):
  input_foldername = input_path + '/batch%i' % i
  if not os.path.exists(input_foldername):
    os.mkdir(input_foldername)
  output_foldername = output_path + '/batch%i' % i
  if not os.path.exists(output_foldername):
    os.mkdir(output_foldername)

#	batch input folder
batch = 0
files = get_only_files(input_path) 
for filename in files:
  target_folder = input_path + '/batch%i/' % batch
  batch += 1
  if batch >= num_cores:
    batch = 0
  os.rename(input_path + '/' + filename, target_folder + filename)

# process batches in parallel

client = Client(processes=False)
with joblib.parallel_backend('dask'):
  joblib.Parallel(verbose=10)(joblib.delayed(save_embeddings)(core) for core in range(num_cores))

for core in range(0, num_cores):
  total = client.submit(save_embeddings, input_path, output_path, core)

# move batched files into one directory
for i in range(0, num_cores):
  source = output_path + '/batch%i/' % i
  files = get_only_files(source) 
  for f in files:
    shutil.move(source + '/' + f, output_path)